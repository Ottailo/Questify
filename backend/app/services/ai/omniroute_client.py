"""
OmniRoute AI Client for the QuestSage planning engine.
Connects directly to the local multi-model gateway (port 20129) with structured JSON generation and graceful fallback.
"""

import httpx
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class OmniRouteClient:
    """Client for OmniRoute local LLM gateway."""

    def __init__(self):
        self.base_url = settings.OMNIROUTE_URL.rstrip("/")
        self.api_key = settings.OMNIROUTE_API_KEY
        self.model = settings.OMNIROUTE_MODEL
        self.timeout = settings.AI_TIMEOUT_SECONDS

    def _clean_json_response(self, text: str) -> Optional[Dict[str, Any]]:
        """Extract valid JSON from LLM output, stripping markdown code fences if present."""
        if not text:
            return None
        
        # Strip ```json ... ``` or ``` ... ```
        cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback regex search for { ... }
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
        return None

    async def analyze_directive(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze a user's freeform directive using QuestSage reasoning.
        Extracts intent, emotional tone, fatigue/energy state, and tactical advice.
        """
        system_prompt = (
            "You are the QuestSage planning assistant, a grounded and practical productivity coach. "
            "Analyze the user's message with empathetic, clear-headed judgment. "
            "Output strictly a JSON object with the following keys:\n"
            "{\n"
            '  "message": "Direct, motivational, tactical response in the voice of a direct, encouraging coach (concise, under 3 sentences).",\n'
            '  "intent": "goal_creation" | "quest_generation" | "progress_analysis" | "fatigue_calibration" | "general_chat",\n'
            '  "confidence": float between 0.70 and 0.99,\n'
            '  "emotional_state": "focused" | "neutral" | "overwhelmed" | "fatigued" | "motivated",\n'
            '  "energy_level": "high" | "moderate" | "low",\n'
            '  "suggestions": ["3 short, tactical follow-up directives the user can click"]\n'
            "}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 400,
            "temperature": 0.3
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    parsed = self._clean_json_response(content)
                    if parsed and "message" in parsed:
                        return parsed

                logger.warning(f"OmniRoute analyze returned status {response.status_code}: {response.text[:150]}")
        except Exception as e:
            logger.error(f"OmniRoute analyze connection failed: {e}")

        # Resilient offline fallback
        return {
            "message": f"Got it — let's break down \"{message[:80]}\" into clear next steps.",
            "intent": "goal_creation",
            "confidence": 0.85,
            "emotional_state": "focused",
            "energy_level": "moderate",
            "suggestions": [
                "Deconstruct this into 3 weighted milestones",
                "Calibrate a 25-minute Pomodoro focus block",
                "Save this as a goal"
            ]
        }

    async def generate_quest_blueprint(
        self,
        user_message: str,
        user_level: int = 1,
        available_time: Optional[int] = 30,
        energy_level: Optional[str] = "moderate"
    ) -> Dict[str, Any]:
        """
        Synthesize a structured, balanced goal plan with weighted subtasks.
        """
        system_prompt = (
            "You are the QuestSage goal architect. "
            "Decompose the user's aspiration into a realistic, highly actionable goal plan. "
            "Break it down into 2 to 4 measurable, sequential subtasks with explicit weights summing to 100%. "
            "Difficulty must be one of: 'easy', 'normal', 'hard'. "
            "XP value should scale with duration and difficulty (typically 50-350 XP). "
            "Output strictly a JSON object with keys:\n"
            "{\n"
            '  "title": "Clear, motivating quest title",\n'
            '  "description": "Tactical summary of the objective (1-2 sentences)",\n'
            '  "quest_type": "Daily" | "Side" | "Main" | "Discipline" | "Engineering",\n'
            '  "difficulty": "easy" | "normal" | "hard",\n'
            '  "domain": "Learning" | "Creative" | "Productive" | "Personal" | "Technical",\n'
            '  "xp_value": integer,\n'
            '  "estimated_duration": integer (minutes),\n'
            '  "subtasks": [\n'
            '    {"text": "Specific actionable subtask", "completed": false, "weight": integer_percent}\n'
            '  ]\n'
            "}"
        )

        user_prompt = (
            f"User Objective: {user_message}\n"
            f"User Level: {user_level}\n"
            f"Target Duration: {available_time or 30} minutes\n"
            f"Current Energy Level: {energy_level or 'moderate'}"
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 550,
            "temperature": 0.4
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    parsed = self._clean_json_response(content)
                    if parsed and "title" in parsed and "subtasks" in parsed:
                        return parsed

                logger.warning(f"OmniRoute quest gen returned status {response.status_code}: {response.text[:150]}")
        except Exception as e:
            logger.error(f"OmniRoute quest generation error: {e}")

        # Resilient fallback quest template
        return {
            "title": f"Goal: {user_message[:50].title()}",
            "description": f"A structured plan to achieve: {user_message}",
            "quest_type": "Side",
            "difficulty": "normal",
            "domain": "Productive",
            "xp_value": 150,
            "estimated_duration": available_time or 30,
            "subtasks": [
                {"text": "Clarify the scope and identify the first concrete action", "completed": False, "weight": 30},
                {"text": "Work through the main milestone without distraction", "completed": False, "weight": 40},
                {"text": "Verify the result and mark progress", "completed": False, "weight": 30}
            ]
        }


# Global OmniRoute client singleton
omniroute_client = OmniRouteClient()

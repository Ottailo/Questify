"""
AI-related Pydantic schemas.
"""

from pydantic import BaseModel
from typing import Dict, List, Any, Optional
from datetime import datetime


class AIRequest(BaseModel):
    """AI request model."""
    message: str
    user_id: int
    context: Dict[str, Any] = {}


class AIResponse(BaseModel):
    """AI response model."""
    message: str
    intent: str
    confidence: float
    entities: List[Dict[str, Any]]
    contextual_understanding: Dict[str, Any]
    suggestions: List[str] = []
    quest_data: Optional[Dict[str, Any]] = None


class QuestGenerationRequest(BaseModel):
    """Quest generation request model."""
    user_message: str
    user_id: int
    available_time: Optional[int] = None
    energy_level: Optional[str] = None
    preferences: Dict[str, Any] = {}


class QuestGenerationResponse(BaseModel):
    """Quest generation response model."""
    quest: Dict[str, Any]
    personalization_data: Dict[str, Any]
    ai_confidence: float
    adaptability_score: float
    creativity_level: float
    suggestions: List[str] = []


class IntentAnalysis(BaseModel):
    """Intent analysis model."""
    intent_type: str
    confidence: float
    entities: List[Dict[str, Any]]
    context: Dict[str, Any]
    timestamp: datetime


class ContextualUnderstanding(BaseModel):
    """Contextual understanding model."""
    emotional_state: str
    energy_level: str
    urgency_level: str
    complexity_preference: str
    domain_focus: str
    temporal_context: str
    social_context: str
    motivation_level: float
    confidence: float


class GeneratedQuest(BaseModel):
    """Generated quest model."""
    title: str
    description: str
    quest_type: str
    difficulty: str
    domain: str
    xp_value: int
    estimated_duration: int
    subtasks: List[Dict[str, Any]]
    personalization_data: Dict[str, Any]
    ai_confidence: float
    adaptability_score: float
    creativity_level: float

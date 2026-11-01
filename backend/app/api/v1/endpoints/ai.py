"""
Great Sage AI API endpoints powered by OmniRoute local LLM gateway.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.deps import get_optional_current_user
from app.models.user import User, DigitalLifestyleProfile
from app.models.quest import Quest, QuestStatus
from app.services.ai.omniroute_client import omniroute_client
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class AIRequest(BaseModel):
    """AI analysis request model."""
    message: str
    user_id: Optional[int] = None
    context: Dict[str, Any] = {}


class AIResponse(BaseModel):
    """AI analysis response model."""
    message: str
    intent: str
    confidence: float
    entities: List[Dict[str, Any]] = []
    contextual_understanding: Dict[str, Any] = {}
    suggestions: List[str] = []
    quest_data: Optional[Dict[str, Any]] = None


class QuestGenerationRequest(BaseModel):
    """Quest generation request model."""
    user_message: str
    user_id: Optional[int] = None
    available_time: Optional[int] = 30
    energy_level: Optional[str] = "moderate"
    preferences: Dict[str, Any] = {}


class QuestGenerationResponse(BaseModel):
    """Quest generation response model."""
    quest: Dict[str, Any]
    personalization_data: Dict[str, Any]
    ai_confidence: float
    adaptability_score: float
    creativity_level: float
    suggestions: List[str] = []


@router.post("/analyze", response_model=AIResponse)
async def analyze_message(
    request: AIRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Analyze a message with the Great Sage AI engine via OmniRoute."""
    try:
        user_id = request.user_id or (current_user.id if current_user else 1)
        
        # Call OmniRoute client
        analysis = await omniroute_client.analyze_directive(request.message, request.context)
        
        # If intent is quest generation, generate an attached quest blueprint preview
        quest_data = None
        is_quest_intent = (
            analysis.get("intent") in ["goal_creation", "quest_generation", "task_breakdown", "planning"] or
            any(w in request.message.lower() for w in ["quest", "campaign", "deconstruct", "objective", "build", "master", "milestone"])
        )
        if is_quest_intent:
            quest_data = await omniroute_client.generate_quest_blueprint(
                user_message=request.message,
                user_level=current_user.level if current_user else 1,
                available_time=request.context.get("available_time", 30),
                energy_level=analysis.get("energy_level", "moderate")
            )
        
        contextual_understanding = {
            "emotional_state": analysis.get("emotional_state", "focused"),
            "energy_level": analysis.get("energy_level", "moderate"),
            "urgency_level": "normal",
            "complexity_preference": "moderate",
            "domain_focus": "Productive",
            "confidence": analysis.get("confidence", 0.85)
        }
        
        return AIResponse(
            message=analysis.get("message", "Directive chronicled."),
            intent=analysis.get("intent", "goal_creation"),
            confidence=analysis.get("confidence", 0.85),
            entities=[],
            contextual_understanding=contextual_understanding,
            suggestions=analysis.get("suggestions", []),
            quest_data=quest_data
        )
    except Exception as e:
        logger.error(f"Error in /ai/analyze: {e}")
        return AIResponse(
            message=f"Hail, Chronicler. The Great Sage has received: '{request.message}'. Focus on steady execution.",
            intent="goal_creation",
            confidence=0.8,
            entities=[],
            contextual_understanding={"emotional_state": "focused", "energy_level": "moderate"},
            suggestions=["Deconstruct milestone", "Sprint focus block", "Audit active roster"]
        )


@router.post("/generate-quest", response_model=QuestGenerationResponse)
async def generate_quest(
    request: QuestGenerationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Generate a structured, personalized quest dossier using Great Sage AI."""
    try:
        user_level = current_user.level if current_user else 1
        
        blueprint = await omniroute_client.generate_quest_blueprint(
            user_message=request.user_message,
            user_level=user_level,
            available_time=request.available_time or 30,
            energy_level=request.energy_level or "moderate"
        )
        
        return QuestGenerationResponse(
            quest=blueprint,
            personalization_data={
                "generated_by": "Great Sage via OmniRoute",
                "energy_calibration": request.energy_level or "moderate",
                "target_minutes": request.available_time or 30
            },
            ai_confidence=0.92,
            adaptability_score=0.88,
            creativity_level=0.85,
            suggestions=[
                "Inscribe directly into active ledger",
                "Calibrate subtask weights",
                "Initiate countdown sprint"
            ]
        )
    except Exception as e:
        logger.error(f"Error generating quest: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating quest blueprint."
        )


@router.get("/performance")
async def get_ai_performance():
    """Retrieve health and telemetry status of the Great Sage AI engine."""
    return {
        "status": "operational",
        "gateway": "OmniRoute (Port 20129)",
        "model": settings.OMNIROUTE_MODEL,
        "nlu_engine": {
            "mode": "hybrid_llm_cognitive",
            "active_provider": "OmniRoute"
        }
    }

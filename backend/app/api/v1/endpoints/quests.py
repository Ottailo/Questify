"""
Quest management API endpoints supporting subtask toggles, victory claims, and recent dossiers.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_optional_current_user
from app.models.quest import Quest, QuestType, QuestDifficulty, QuestStatus
from app.models.user import User
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class QuestCreate(BaseModel):
    """Quest creation payload."""
    title: str
    description: str
    quest_type: str = "side"
    difficulty: str = "normal"
    xp_value: int = 150
    estimated_duration: int = 30
    subtasks: List[Dict[str, Any]] = []
    user_id: Optional[int] = None


class QuestUpdate(BaseModel):
    """Quest update payload."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    progress_percentage: Optional[float] = None
    difficulty_rating: Optional[int] = None
    satisfaction_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    user_id: Optional[int] = None


class QuestResponse(BaseModel):
    """Quest response model."""
    id: int
    title: str
    description: str
    quest_type: str
    difficulty: str
    status: str
    xp_value: int
    estimated_duration: int
    actual_duration: Optional[int] = None
    progress_percentage: float
    subtasks: List[Dict[str, Any]]
    personalization_data: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime


def _format_quest_response(quest: Quest) -> QuestResponse:
    """Helper to convert SQLAlchemy model to response DTO."""
    q_type = quest.quest_type.value if hasattr(quest.quest_type, "value") else str(quest.quest_type)
    q_diff = quest.difficulty.value if hasattr(quest.difficulty, "value") else str(quest.difficulty)
    q_stat = quest.status.value if hasattr(quest.status, "value") else str(quest.status)

    return QuestResponse(
        id=quest.id,
        title=quest.title,
        description=quest.description,
        quest_type=q_type,
        difficulty=q_diff,
        status=q_stat,
        xp_value=quest.xp_value or 100,
        estimated_duration=quest.estimated_duration or 30,
        actual_duration=quest.actual_duration,
        progress_percentage=quest.progress_percentage or 0.0,
        subtasks=quest.subtasks or [],
        personalization_data=quest.personalization_data or {},
        created_at=quest.created_at or datetime.now(),
        updated_at=quest.updated_at or datetime.now()
    )


@router.get("/recent", response_model=List[QuestResponse])
async def get_recent_quests(
    limit: int = 5,
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get recent active campaign dossiers for the dashboard."""
    target_user_id = user_id or (current_user.id if current_user else 1)
    
    quests = db.query(Quest).filter(
        Quest.user_id == target_user_id
    ).order_by(Quest.created_at.desc()).limit(limit).all()
    
    return [_format_quest_response(q) for q in quests]


@router.get("/", response_model=List[QuestResponse])
async def get_all_quests(
    user_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get all quests for user with optional filter."""
    target_user_id = user_id or (current_user.id if current_user else 1)
    
    query = db.query(Quest).filter(Quest.user_id == target_user_id)
    if status_filter and status_filter != "all":
        try:
            query = query.filter(Quest.status == QuestStatus(status_filter))
        except ValueError:
            pass
            
    quests = query.order_by(Quest.created_at.desc()).limit(limit).all()
    return [_format_quest_response(q) for q in quests]


@router.post("/", response_model=QuestResponse)
async def create_quest(
    quest_data: QuestCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Inscribe a new quest into the Guild Ledger."""
    target_user_id = quest_data.user_id or (current_user.id if current_user else 1)
    
    # Ensure user exists; if fallback user 1 doesn't exist, create a default chronicler
    user = db.query(User).filter(User.id == target_user_id).first()
    if not user:
        user = User(
            id=target_user_id,
            email=f"chronicler_{target_user_id}@guild.ledger",
            username=f"Chronicler_{target_user_id}",
            hashed_password="default_hash",
            level=1,
            xp=0,
            wisdom_points=10,
            streak_days=1,
            is_active=True
        )
        db.add(user)
        db.commit()
    
    # Process and sanitize subtasks
    formatted_subtasks = []
    for idx, s in enumerate(quest_data.subtasks):
        formatted_subtasks.append({
            "id": s.get("id", idx + 1),
            "text": s.get("text", f"Objective {idx + 1}"),
            "completed": bool(s.get("completed", False)),
            "weight": s.get("weight", int(100 / max(1, len(quest_data.subtasks))))
        })
    
    # Map quest_type and difficulty safely
    try:
        q_type = QuestType(quest_data.quest_type.lower())
    except Exception:
        q_type = QuestType.side
        
    try:
        q_diff = QuestDifficulty(quest_data.difficulty.lower())
    except Exception:
        q_diff = QuestDifficulty.normal
        
    new_quest = Quest(
        user_id=target_user_id,
        title=quest_data.title.strip(),
        description=quest_data.description.strip(),
        quest_type=q_type,
        difficulty=q_diff,
        xp_value=quest_data.xp_value,
        estimated_duration=quest_data.estimated_duration,
        subtasks=formatted_subtasks,
        status=QuestStatus.active,
        progress_percentage=0.0,
        personalization_data={}
    )
    
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)
    
    return _format_quest_response(new_quest)


@router.patch("/{quest_id}/subtasks/{subtask_id}/toggle", response_model=QuestResponse)
async def toggle_subtask(
    quest_id: int,
    subtask_id: int,
    db: Session = Depends(get_db)
):
    """Toggle completion status of a specific subtask and recalculate progress percentage."""
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest dossier not found.")
        
    subtasks = list(quest.subtasks or [])
    found = False
    for s in subtasks:
        if s.get("id") == subtask_id:
            s["completed"] = not s.get("completed", False)
            found = True
            break
            
    if not found and subtask_id <= len(subtasks):
        subtasks[subtask_id - 1]["completed"] = not subtasks[subtask_id - 1].get("completed", False)
        found = True

    if not found:
        raise HTTPException(status_code=404, detail="Subtask objective not found.")
        
    # Recalculate progress percentage
    total_weight = sum(s.get("weight", 0) for s in subtasks) or 100
    completed_weight = sum(s.get("weight", 0) for s in subtasks if s.get("completed"))
    quest.progress_percentage = min(100.0, round((completed_weight / total_weight) * 100, 1))
    
    # If 100% completed, mark status active/completed
    if quest.progress_percentage >= 100.0:
        quest.status = QuestStatus.completed
        quest.completed_at = datetime.now()
    else:
        quest.status = QuestStatus.active
        
    quest.subtasks = subtasks
    quest.updated_at = datetime.now()
    
    db.commit()
    db.refresh(quest)
    return _format_quest_response(quest)


@router.post("/{quest_id}/complete")
async def claim_quest_victory(
    quest_id: int,
    db: Session = Depends(get_db)
):
    """Claim quest completion victory, payout XP, and update level progression."""
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest dossier not found.")
        
    quest.status = QuestStatus.completed
    quest.progress_percentage = 100.0
    quest.completed_at = datetime.now()
    
    user = db.query(User).filter(User.id == quest.user_id).first()
    leveled_up = False
    old_level = user.level if user else 1
    new_level = old_level
    
    if user:
        user.xp += quest.xp_value
        user.wisdom_points += (quest.xp_value // 3)
        
        # Calculate level: 500 XP per level
        calculated_level = (user.xp // 500) + 1
        if calculated_level > user.level:
            leveled_up = True
            user.level = calculated_level
            new_level = user.level
            
        user.last_activity = datetime.now()
        
    db.commit()
    db.refresh(quest)
    
    return {
        "message": f"Victory achieved for quest: '{quest.title}'!",
        "quest_id": quest.id,
        "xp_earned": quest.xp_value,
        "wisdom_earned": quest.xp_value // 3,
        "new_xp": user.xp if user else 0,
        "level": new_level,
        "leveled_up": leveled_up
    }


@router.put("/{quest_id}", response_model=QuestResponse)
async def update_quest(
    quest_id: int,
    quest_update: QuestUpdate,
    db: Session = Depends(get_db)
):
    """Update quest dossier details."""
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest dossier not found.")
        
    if quest_update.title:
        quest.title = quest_update.title.strip()
    if quest_update.description:
        quest.description = quest_update.description.strip()
    if quest_update.status:
        try:
            quest.status = QuestStatus(quest_update.status.lower())
        except ValueError:
            pass
    if quest_update.progress_percentage is not None:
        quest.progress_percentage = quest_update.progress_percentage
        
    quest.updated_at = datetime.now()
    db.commit()
    db.refresh(quest)
    return _format_quest_response(quest)


@router.delete("/{quest_id}")
async def delete_quest(
    quest_id: int,
    db: Session = Depends(get_db)
):
    """Delete a quest dossier from the ledger."""
    quest = db.query(Quest).filter(Quest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest dossier not found.")
        
    db.delete(quest)
    db.commit()
    return {"message": "Quest dossier erased from active ledger."}

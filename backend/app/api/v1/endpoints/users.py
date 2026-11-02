"""
User profile, telemetry stats, achievements, and Digital Lifestyle Profile (DLP) endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_optional_current_user
from app.models.user import User, DigitalLifestyleProfile
from app.models.quest import Quest, QuestStatus
from app.models.achievement import Achievement, UserAchievement
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class DLPUpdate(BaseModel):
    """Digital Lifestyle Profile update payload."""
    core_traits: Optional[Dict[str, Any]] = None
    interests: Optional[Dict[str, Any]] = None
    communication_style: Optional[str] = None
    learning_style: Optional[Dict[str, Any]] = None
    motivation_triggers: Optional[List[str]] = None
    energy_patterns: Optional[Dict[str, Any]] = None
    difficulty_preference: Optional[str] = None


@router.get("/profile")
async def get_current_user_profile(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get active user profile and telemetry."""
    user = current_user or db.query(User).first()
    if not user:
        user = User(
            id=1,
            email="user@questsage.app",
            username="QuestSageUser",
            hashed_password="default_hash",
            level=5,
            xp=1250,
            wisdom_points=340,
            streak_days=7,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    total_quests = db.query(Quest).filter(Quest.user_id == user.id).count()
    completed_quests = db.query(Quest).filter(
        Quest.user_id == user.id,
        Quest.status == QuestStatus.completed
    ).count()
    active_quests = db.query(Quest).filter(
        Quest.user_id == user.id,
        Quest.status.in_([QuestStatus.active, QuestStatus.pending])
    ).count()

    completion_rate = round((completed_quests / total_quests * 100), 1) if total_quests > 0 else 0.0

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "title": user.username or "QuestSage User",
        "level": user.level,
        "xp": user.xp,
        "next_level_xp": user.level * 500,
        "wisdom_points": user.wisdom_points,
        "streak_days": user.streak_days,
        "total_quests": total_quests,
        "completed_quests": completed_quests,
        "active_quests": active_quests,
        "completion_rate": completion_rate,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_activity": user.last_activity.isoformat() if user.last_activity else None
    }


@router.get("/achievements")
async def get_user_achievements(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get user achievements dynamically evaluated against real quest telemetry."""
    user = current_user or db.query(User).first()
    user_id = user.id if user else 1
    xp = user.xp if user else 0
    streak = user.streak_days if user else 0
    
    total_completed = db.query(Quest).filter(
        Quest.user_id == user_id,
        Quest.status == QuestStatus.completed
    ).count()

    achievements = [
        {
            "id": 1,
            "name": "First Step",
            "description": "Completed your first goal.",
            "achieved": total_completed >= 1,
            "achieved_at": user.created_at.isoformat() if total_completed >= 1 and user and user.created_at else None,
            "icon": "Target",
            "rarity": "Common"
        },
        {
            "id": 2,
            "name": "Week Warrior",
            "description": "Maintained a 7-day activity streak.",
            "achieved": streak >= 7,
            "achieved_at": datetime.now().isoformat() if streak >= 7 else None,
            "icon": "Flame",
            "rarity": "Rare"
        },
        {
            "id": 3,
            "name": "XP Milestone",
            "description": "Earned 1,000+ XP across all goals.",
            "achieved": xp >= 1000,
            "achieved_at": datetime.now().isoformat() if xp >= 1000 else None,
            "icon": "Sparkles",
            "rarity": "Rare"
        },
        {
            "id": 4,
            "name": "Goal Crusher",
            "description": "Completed 10 or more goals.",
            "achieved": total_completed >= 10,
            "achieved_at": datetime.now().isoformat() if total_completed >= 10 else None,
            "icon": "Trophy",
            "rarity": "Epic"
        }
    ]
    return achievements


@router.get("/activity")
async def get_user_activity(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get recent user activity history."""
    user = current_user or db.query(User).first()
    user_id = user.id if user else 1

    recent_quests = db.query(Quest).filter(
        Quest.user_id == user_id
    ).order_by(Quest.updated_at.desc()).limit(10).all()

    activity = []
    for q in recent_quests:
        action = "Completed goal" if q.status == QuestStatus.completed else "Created goal"
        activity.append({
            "id": q.id,
            "action": action,
            "quest_name": q.title,
            "xp_earned": q.xp_value if q.status == QuestStatus.completed else 0,
            "timestamp": (q.completed_at or q.updated_at or q.created_at or datetime.now()).isoformat()
        })
    return activity


@router.get("/stats")
@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Get user telemetry stats for the dashboard HUD."""
    target_id = user_id or (current_user.id if current_user else 1)
    user = db.query(User).filter(User.id == target_id).first()
    if not user:
        user = db.query(User).first()

    if not user:
        return {
            "user_id": 1,
            "level": 1,
            "xp": 0,
            "wisdom_points": 10,
            "streak_days": 1,
            "total_quests": 0,
            "completed_quests": 0,
            "active_quests": 0,
            "completion_rate": 0.0,
            "last_activity": datetime.now().isoformat()
        }

    total_quests = db.query(Quest).filter(Quest.user_id == user.id).count()
    completed_quests = db.query(Quest).filter(
        Quest.user_id == user.id,
        Quest.status == QuestStatus.completed
    ).count()
    active_quests = db.query(Quest).filter(
        Quest.user_id == user.id,
        Quest.status.in_([QuestStatus.active, QuestStatus.pending])
    ).count()

    completion_rate = round((completed_quests / total_quests * 100), 1) if total_quests > 0 else 0.0

    return {
        "user_id": user.id,
        "level": user.level,
        "xp": user.xp,
        "wisdom_points": user.wisdom_points,
        "streak_days": user.streak_days,
        "total_quests": total_quests,
        "completed_quests": completed_quests,
        "active_quests": active_quests,
        "completion_rate": completion_rate,
        "last_activity": user.last_activity.isoformat() if user.last_activity else datetime.now().isoformat()
    }


@router.get("/{user_id}/dlp")
async def get_user_dlp(user_id: int, db: Session = Depends(get_db)):
    """Get Digital Lifestyle Profile (DLP)."""
    dlp = db.query(DigitalLifestyleProfile).filter(DigitalLifestyleProfile.user_id == user_id).first()
    if not dlp:
        dlp = DigitalLifestyleProfile(user_id=user_id)
        db.add(dlp)
        db.commit()
        db.refresh(dlp)

    return {
        "core_traits": dlp.core_traits or {},
        "interests": dlp.interests or {},
        "communication_style": dlp.communication_style or "balanced",
        "learning_style": dlp.learning_style or {},
        "motivation_triggers": dlp.motivation_triggers or [],
        "energy_patterns": dlp.energy_patterns or {},
        "difficulty_preference": dlp.difficulty_preference or "moderate",
        "last_updated": dlp.last_updated.isoformat() if dlp.last_updated else datetime.now().isoformat()
    }


@router.put("/{user_id}/dlp")
async def update_user_dlp(user_id: int, dlp_update: DLPUpdate, db: Session = Depends(get_db)):
    """Update Digital Lifestyle Profile (DLP) calibration."""
    dlp = db.query(DigitalLifestyleProfile).filter(DigitalLifestyleProfile.user_id == user_id).first()
    if not dlp:
        dlp = DigitalLifestyleProfile(user_id=user_id)
        db.add(dlp)

    if dlp_update.core_traits is not None:
        dlp.core_traits = dlp_update.core_traits
    if dlp_update.interests is not None:
        dlp.interests = dlp_update.interests
    if dlp_update.communication_style is not None:
        dlp.communication_style = dlp_update.communication_style
    if dlp_update.learning_style is not None:
        dlp.learning_style = dlp_update.learning_style
    if dlp_update.motivation_triggers is not None:
        dlp.motivation_triggers = dlp_update.motivation_triggers
    if dlp_update.energy_patterns is not None:
        dlp.energy_patterns = dlp_update.energy_patterns
    if dlp_update.difficulty_preference is not None:
        dlp.difficulty_preference = dlp_update.difficulty_preference

    dlp.last_updated = datetime.now()
    db.commit()
    db.refresh(dlp)
    return {"message": "Digital Lifestyle Profile calibrated successfully.", "last_updated": dlp.last_updated}

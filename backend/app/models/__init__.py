"""
Database models package.
Importing all models here registers them in the SQLAlchemy declarative registry.
"""

from app.models.user import User, DigitalLifestyleProfile, UserSession
from app.models.quest import Quest, QuestType, QuestDifficulty, QuestStatus, QuestTemplate, QuestSequence
from app.models.achievement import Achievement, UserAchievement

__all__ = [
    "User",
    "DigitalLifestyleProfile",
    "UserSession",
    "Quest",
    "QuestType",
    "QuestDifficulty",
    "QuestStatus",
    "QuestTemplate",
    "QuestSequence",
    "Achievement",
    "UserAchievement",
]

"""
Achievement and gamification models.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Achievement(Base):
    """Achievement definitions."""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Achievement info
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # quest, skill, social, milestone, etc.
    tier = Column(String(50), default="bronze")  # bronze, silver, gold, platinum, diamond
    
    # Requirements
    requirements = Column(JSON, default=dict)  # What's needed to unlock
    points_required = Column(Integer, default=0)
    quests_required = Column(Integer, default=0)
    skills_required = Column(JSON, default=list)
    
    # Rewards
    xp_reward = Column(Integer, default=0)
    wisdom_points_reward = Column(Integer, default=0)
    badge_url = Column(String(500))
    title_unlock = Column(String(100))  # Unlocks a special title
    
    # Metadata
    is_hidden = Column(Boolean, default=False)  # Hidden until unlocked
    is_repeatable = Column(Boolean, default=False)
    rarity = Column(Float, default=0.1)  # 0.0 to 1.0, how rare it is
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class UserAchievement(Base):
    """User achievement unlocks."""
    
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False, index=True)
    
    # Unlock info
    unlocked_at = Column(DateTime, default=func.now())
    progress_percentage = Column(Float, default=100.0)  # For progress-based achievements
    
    # Context
    unlocked_context = Column(JSON, default=dict)  # What triggered the unlock
    quest_id = Column(Integer)  # If unlocked by completing a quest
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")


class Skill(Base):
    """Skill tracking system."""
    
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Skill info
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # technical, creative, social, physical, etc.
    domain = Column(String(100))  # programming, art, fitness, etc.
    
    # Skill levels
    current_level = Column(Integer, default=1)  # 1-100
    experience_points = Column(Integer, default=0)
    mastery_percentage = Column(Float, default=0.0)  # 0.0 to 1.0
    
    # Progress tracking
    quests_completed = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)  # in minutes
    last_practiced = Column(DateTime)
    
    # Learning data
    learning_curve = Column(JSON, default=dict)  # Track learning progress over time
    strengths = Column(JSON, default=list)  # Areas of strength
    weaknesses = Column(JSON, default=list)  # Areas needing improvement
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class WisdomPoint(Base):
    """Wisdom points transaction log."""
    
    __tablename__ = "wisdom_points"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Transaction info
    points = Column(Integer, nullable=False)  # Can be positive or negative
    reason = Column(String(255), nullable=False)  # quest_completion, achievement, streak, etc.
    category = Column(String(100), nullable=False)  # quest, achievement, social, bonus, penalty
    
    # Context
    quest_id = Column(Integer)  # If from quest completion
    achievement_id = Column(Integer)  # If from achievement
    context_data = Column(JSON, default=dict)  # Additional context
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())


class UserLevel(Base):
    """User level progression tracking."""
    
    __tablename__ = "user_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Level info
    level = Column(Integer, nullable=False)
    xp_required = Column(Integer, nullable=False)
    xp_current = Column(Integer, default=0)
    
    # Level benefits
    quest_slots = Column(Integer, default=3)  # Max quests at this level
    wisdom_multiplier = Column(Float, default=1.0)  # XP multiplier
    special_abilities = Column(JSON, default=list)  # Unlocked abilities
    
    # Timestamps
    reached_at = Column(DateTime, default=func.now())

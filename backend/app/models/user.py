"""
User model and Digital Lifestyle Profile (DLP) system.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """User model with Digital Lifestyle Profile."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Basic profile
    first_name = Column(String(100))
    last_name = Column(String(100))
    avatar_url = Column(String(500))
    
    # QuestSage specific
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    wisdom_points = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    last_activity = Column(DateTime, default=func.now())
    
    # Digital Lifestyle Profile (DLP)
    dlp_data = Column(JSON, default=dict)  # Stores the complete DLP
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    quests = relationship("Quest", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class DigitalLifestyleProfile(Base):
    """Digital Lifestyle Profile for advanced personalization."""
    
    __tablename__ = "user_dlp"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Core Traits
    core_traits = Column(JSON, default=dict)  # {trait_name: {intensity: float, confidence: float}}
    
    # Learning Style
    learning_style = Column(JSON, default=dict)  # {visual: float, auditory: float, kinesthetic: float, reading: float}
    
    # Communication Preferences
    communication_style = Column(String(50), default="balanced")  # analytical, creative, collaborative, empathetic, balanced
    preferred_tone = Column(String(50), default="supportive")  # direct, supportive, encouraging, professional
    
    # Motivation Triggers
    motivation_triggers = Column(JSON, default=list)  # [achievement, recognition, progress, mastery, social, autonomy]
    
    # Energy Patterns
    energy_patterns = Column(JSON, default=dict)  # {morning: float, afternoon: float, evening: float, night: float}
    peak_performance_times = Column(JSON, default=list)  # ["morning", "afternoon"]
    
    # Interests and Skills
    interests = Column(JSON, default=dict)  # {interest: strength_score}
    skills = Column(JSON, default=dict)  # {skill: competency_level}
    skill_gaps = Column(JSON, default=list)  # [skill_name, priority_level]
    
    # Behavioral Patterns
    quest_completion_patterns = Column(JSON, default=dict)  # {difficulty: completion_rate, time_of_day: success_rate}
    preferred_quest_types = Column(JSON, default=list)  # [learning, creative, productive, social, personal]
    difficulty_preference = Column(String(20), default="moderate")  # easy, moderate, challenging, adaptive
    
    # Context Awareness
    current_goals = Column(JSON, default=list)  # [goal_id, priority, timeline]
    life_phase = Column(String(50), default="exploration")  # exploration, establishment, maintenance, transition
    available_time_slots = Column(JSON, default=dict)  # {day_of_week: [time_slots]}
    
    # AI Learning Data
    adaptation_rate = Column(Float, default=0.3)  # How quickly the profile adapts
    confidence_score = Column(Float, default=0.5)  # Confidence in profile accuracy
    last_updated = Column(DateTime, default=func.now())
    update_frequency = Column(Integer, default=24)  # hours between updates
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class UserSession(Base):
    """User session tracking for behavioral analysis."""
    
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_id = Column(String(255), unique=True, index=True)
    
    # Session data
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)
    duration_minutes = Column(Integer)
    
    # Context data
    device_type = Column(String(50))  # mobile, desktop, tablet
    location = Column(String(100))
    time_of_day = Column(String(20))  # morning, afternoon, evening, night
    
    # Behavioral data
    quests_created = Column(Integer, default=0)
    quests_completed = Column(Integer, default=0)
    quests_abandoned = Column(Integer, default=0)
    ai_interactions = Column(Integer, default=0)
    
    # Emotional context
    mood_at_start = Column(String(50))
    mood_at_end = Column(String(50))
    energy_level = Column(Integer)  # 1-10 scale
    
    # Session outcome
    satisfaction_rating = Column(Integer)  # 1-5 scale
    productivity_score = Column(Float)  # calculated based on quest completion
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())

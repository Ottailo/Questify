"""
Quest model and related structures.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class QuestType(enum.Enum):
    """Quest type enumeration."""
    main = "main"
    side = "side"
    daily = "daily"
    epic = "epic"
    legendary = "legendary"


class QuestDifficulty(enum.Enum):
    """Quest difficulty enumeration."""
    easy = "easy"
    normal = "normal"
    hard = "hard"
    epic = "epic"
    legendary = "legendary"


class QuestStatus(enum.Enum):
    """Quest status enumeration."""
    pending = "pending"
    active = "active"
    completed = "completed"
    abandoned = "abandoned"
    paused = "paused"


class Quest(Base):
    """Quest model with advanced personalization."""
    
    __tablename__ = "quests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Basic quest info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    quest_type = Column(Enum(QuestType), default=QuestType.side)
    difficulty = Column(Enum(QuestDifficulty), default=QuestDifficulty.normal)
    status = Column(Enum(QuestStatus), default=QuestStatus.pending)
    
    # Quest details
    xp_value = Column(Integer, default=10)
    estimated_duration = Column(Integer)  # in minutes
    actual_duration = Column(Integer)  # in minutes
    priority = Column(Integer, default=1)  # 1-5 scale
    
    # Personalization data
    personalization_data = Column(JSON, default=dict)  # Why this quest was chosen
    adaptability_score = Column(Float, default=0.5)  # How well it adapts to user
    creativity_level = Column(Float, default=0.5)  # How creative/unique it is
    uniqueness_factors = Column(JSON, default=list)  # What makes it unique
    
    # AI Generation data
    generated_by_ai = Column(Boolean, default=True)
    ai_confidence = Column(Float, default=0.8)  # AI confidence in quest quality
    generation_context = Column(JSON, default=dict)  # Context used for generation
    nlu_intent = Column(String(100))  # Intent that triggered generation
    
    # Quest progression
    progress_percentage = Column(Float, default=0.0)
    current_step = Column(Integer, default=0)
    total_steps = Column(Integer, default=1)
    
    # Subtasks
    subtasks = Column(JSON, default=list)  # List of subtask objects
    
    # Timing
    scheduled_for = Column(DateTime)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    deadline = Column(DateTime)
    
    # User feedback
    difficulty_rating = Column(Integer)  # 1-5 scale
    satisfaction_rating = Column(Integer)  # 1-5 scale
    helpful_rating = Column(Integer)  # 1-5 scale
    user_feedback = Column(Text)
    
    # Learning data
    learning_insights = Column(JSON, default=dict)  # What was learned
    skill_development = Column(JSON, default=list)  # Skills developed
    knowledge_gained = Column(JSON, default=list)  # Knowledge gained
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="quests")


class QuestTemplate(Base):
    """Quest templates for AI generation."""
    
    __tablename__ = "quest_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Template info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    domain = Column(String(100), nullable=False)  # learning, creative, productive, social, personal
    category = Column(String(100))  # programming, art, fitness, etc.
    
    # Template structure
    base_structure = Column(JSON, default=list)  # [step1, step2, step3, ...]
    adaptation_points = Column(JSON, default=list)  # Points where personalization occurs
    creativity_factors = Column(JSON, default=list)  # Factors that can be made creative
    
    # Difficulty scaling
    difficulty_scaling = Column(JSON, default=dict)  # How to scale difficulty
    complexity_rules = Column(JSON, default=dict)  # Rules for complexity adjustment
    
    # Personalization rules
    personalization_rules = Column(JSON, default=dict)  # How to personalize
    user_trait_mappings = Column(JSON, default=dict)  # Map traits to adaptations
    
    # Success metrics
    success_metrics = Column(JSON, default=dict)  # How to measure success
    completion_criteria = Column(JSON, default=dict)  # Clear completion criteria
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    average_rating = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class QuestSequence(Base):
    """Quest sequences for complex goal breakdown."""
    
    __tablename__ = "quest_sequences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Sequence info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    goal = Column(String(500), nullable=False)  # The overarching goal
    
    # Sequence structure
    quest_ids = Column(JSON, default=list)  # Ordered list of quest IDs
    current_quest_index = Column(Integer, default=0)
    total_quests = Column(Integer, default=0)
    
    # Progress tracking
    completion_percentage = Column(Float, default=0.0)
    estimated_total_duration = Column(Integer)  # in minutes
    actual_duration = Column(Integer)  # in minutes
    
    # AI Generation data
    generated_by_ai = Column(Boolean, default=True)
    generation_strategy = Column(String(100))  # Strategy used for generation
    adaptation_level = Column(Float, default=0.5)  # How much it adapts to user
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime)

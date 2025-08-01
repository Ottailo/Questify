from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    adventurer_name = Column(String, nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    xp_for_next_level = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_interaction_mood = Column(String, default="neutral")
    
    # Relationships
    avatar = relationship("Avatar", back_populates="user", uselist=False)
    quests = relationship("Quest", back_populates="user")
    friendships_one = relationship("Friendship", foreign_keys="Friendship.user_one_id", back_populates="user_one")
    friendships_two = relationship("Friendship", foreign_keys="Friendship.user_two_id", back_populates="user_two")
    guild_memberships = relationship("GuildMember", back_populates="user")
    hero_pass = relationship("HeroPass", back_populates="user", uselist=False)
    inventory = relationship("UserInventory", back_populates="user")

class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    xp_value = Column(Integer, default=10)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="quests")

class Avatar(Base):
    __tablename__ = "avatars"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    head_style = Column(String, default="default")
    body_style = Column(String, default="default")
    hair_color = Column(String, default="brown")
    skin_tone = Column(String, default="medium")
    
    # Relationships
    user = relationship("User", back_populates="avatar")

class Friendship(Base):
    __tablename__ = "friendships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_one_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_two_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected
    action_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_one = relationship("User", foreign_keys=[user_one_id], back_populates="friendships_one")
    user_two = relationship("User", foreign_keys=[user_two_id], back_populates="friendships_two")

class Guild(Base):
    __tablename__ = "guilds"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    leader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    members = relationship("GuildMember", back_populates="guild")
    quests = relationship("GuildQuest", back_populates="guild")

class GuildMember(Base):
    __tablename__ = "guild_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=False)
    role = Column(String, default="member")  # member, officer, leader
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="guild_memberships")
    guild = relationship("Guild", back_populates="members")

class GuildQuest(Base):
    __tablename__ = "guild_quests"
    
    id = Column(Integer, primary_key=True, index=True)
    guild_id = Column(Integer, ForeignKey("guilds.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    target_value = Column(Integer, default=100)
    current_value = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Relationships
    guild = relationship("Guild", back_populates="quests")

class HeroPass(Base):
    __tablename__ = "hero_passes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    season_id = Column(Integer, default=1)
    xp_progress = Column(Integer, default=0)
    premium_track_unlocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="hero_pass")

class UserInventory(Base):
    __tablename__ = "user_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(String, nullable=False)  # Cosmetic item identifier
    acquired_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="inventory") 
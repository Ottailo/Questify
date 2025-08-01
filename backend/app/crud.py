from sqlalchemy.orm import Session
from app.models import User, Quest, Avatar, Friendship, Guild, GuildMember, GuildQuest, HeroPass, UserInventory
from app.schemas import UserCreate, QuestCreate, AvatarCreate, GuildCreate, GuildQuestCreate
from app.auth import get_password_hash
from datetime import datetime
from typing import List, Optional

# User CRUD operations
def create_user(db: Session, user: UserCreate):
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        adventurer_name=user.adventurer_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()

def update_user_xp(db: Session, user_id: int, xp_gained: int):
    """Update user XP and check for level up."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    user.xp += xp_gained
    
    # Check for level up
    while user.xp >= user.xp_for_next_level:
        user.level += 1
        user.xp -= user.xp_for_next_level
        user.xp_for_next_level = int(user.xp_for_next_level * 1.5)
    
    db.commit()
    db.refresh(user)
    return user

# Quest CRUD operations
def create_quest(db: Session, quest: QuestCreate, user_id: int):
    """Create a new quest for a user."""
    db_quest = Quest(**quest.dict(), user_id=user_id)
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest

def get_user_quests(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all quests for a user."""
    return db.query(Quest).filter(Quest.user_id == user_id).offset(skip).limit(limit).all()

def get_quest_by_id(db: Session, quest_id: int):
    """Get quest by ID."""
    return db.query(Quest).filter(Quest.id == quest_id).first()

def complete_quest(db: Session, quest_id: int, user_id: int):
    """Complete a quest and award XP."""
    quest = get_quest_by_id(db, quest_id)
    if not quest or quest.user_id != user_id or quest.is_completed:
        return None
    
    quest.is_completed = True
    quest.completed_at = datetime.utcnow()
    
    # Award XP to user
    user = update_user_xp(db, user_id, quest.xp_value)
    
    db.commit()
    db.refresh(quest)
    return quest

# Avatar CRUD operations
def create_avatar(db: Session, avatar: AvatarCreate, user_id: int):
    """Create or update user avatar."""
    existing_avatar = db.query(Avatar).filter(Avatar.user_id == user_id).first()
    if existing_avatar:
        for key, value in avatar.dict().items():
            setattr(existing_avatar, key, value)
        db.commit()
        db.refresh(existing_avatar)
        return existing_avatar
    else:
        db_avatar = Avatar(**avatar.dict(), user_id=user_id)
        db.add(db_avatar)
        db.commit()
        db.refresh(db_avatar)
        return db_avatar

def get_user_avatar(db: Session, user_id: int):
    """Get user avatar."""
    return db.query(Avatar).filter(Avatar.user_id == user_id).first()

# Friendship CRUD operations
def create_friendship_request(db: Session, user_one_id: int, user_two_id: int):
    """Create a friendship request."""
    # Check if friendship already exists
    existing = db.query(Friendship).filter(
        ((Friendship.user_one_id == user_one_id) & (Friendship.user_two_id == user_two_id)) |
        ((Friendship.user_one_id == user_two_id) & (Friendship.user_two_id == user_one_id))
    ).first()
    
    if existing:
        return existing
    
    db_friendship = Friendship(
        user_one_id=user_one_id,
        user_two_id=user_two_id,
        action_user_id=user_one_id
    )
    db.add(db_friendship)
    db.commit()
    db.refresh(db_friendship)
    return db_friendship

def accept_friendship(db: Session, friendship_id: int, user_id: int):
    """Accept a friendship request."""
    friendship = db.query(Friendship).filter(Friendship.id == friendship_id).first()
    if not friendship or friendship.user_two_id != user_id:
        return None
    
    friendship.status = "accepted"
    friendship.action_user_id = user_id
    db.commit()
    db.refresh(friendship)
    return friendship

def get_user_friendships(db: Session, user_id: int):
    """Get all friendships for a user."""
    return db.query(Friendship).filter(
        ((Friendship.user_one_id == user_id) | (Friendship.user_two_id == user_id)) &
        (Friendship.status == "accepted")
    ).all()

# Guild CRUD operations
def create_guild(db: Session, guild: GuildCreate, leader_id: int):
    """Create a new guild."""
    db_guild = Guild(**guild.dict(), leader_id=leader_id)
    db.add(db_guild)
    db.commit()
    db.refresh(db_guild)
    
    # Add leader as guild member
    db_member = GuildMember(user_id=leader_id, guild_id=db_guild.id, role="leader")
    db.add(db_member)
    db.commit()
    
    return db_guild

def get_guild_by_id(db: Session, guild_id: int):
    """Get guild by ID."""
    return db.query(Guild).filter(Guild.id == guild_id).first()

def get_user_guild(db: Session, user_id: int):
    """Get the guild that a user belongs to."""
    member = db.query(GuildMember).filter(GuildMember.user_id == user_id).first()
    if member:
        return get_guild_by_id(db, member.guild_id)
    return None

def add_guild_member(db: Session, guild_id: int, user_id: int, role: str = "member"):
    """Add a user to a guild."""
    existing = db.query(GuildMember).filter(
        GuildMember.guild_id == guild_id,
        GuildMember.user_id == user_id
    ).first()
    
    if existing:
        return existing
    
    db_member = GuildMember(guild_id=guild_id, user_id=user_id, role=role)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

# Guild Quest CRUD operations
def create_guild_quest(db: Session, quest: GuildQuestCreate, guild_id: int):
    """Create a new guild quest."""
    db_quest = GuildQuest(**quest.dict(), guild_id=guild_id)
    db.add(db_quest)
    db.commit()
    db.refresh(db_quest)
    return db_quest

def update_guild_quest_progress(db: Session, quest_id: int, progress: int):
    """Update guild quest progress."""
    quest = db.query(GuildQuest).filter(GuildQuest.id == quest_id).first()
    if not quest:
        return None
    
    quest.current_value += progress
    if quest.current_value >= quest.target_value and not quest.is_completed:
        quest.is_completed = True
        quest.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(quest)
    return quest

def get_guild_quests(db: Session, guild_id: int):
    """Get all quests for a guild."""
    return db.query(GuildQuest).filter(GuildQuest.guild_id == guild_id).all()

# Hero Pass CRUD operations
def create_hero_pass(db: Session, user_id: int):
    """Create a hero pass for a user."""
    existing = db.query(HeroPass).filter(HeroPass.user_id == user_id).first()
    if existing:
        return existing
    
    db_hero_pass = HeroPass(user_id=user_id)
    db.add(db_hero_pass)
    db.commit()
    db.refresh(db_hero_pass)
    return db_hero_pass

def update_hero_pass_xp(db: Session, user_id: int, xp_gained: int):
    """Update hero pass XP progress."""
    hero_pass = db.query(HeroPass).filter(HeroPass.user_id == user_id).first()
    if not hero_pass:
        hero_pass = create_hero_pass(db, user_id)
    
    hero_pass.xp_progress += xp_gained
    db.commit()
    db.refresh(hero_pass)
    return hero_pass

# Inventory CRUD operations
def add_item_to_inventory(db: Session, user_id: int, item_id: str):
    """Add an item to user inventory."""
    db_item = UserInventory(user_id=user_id, item_id=item_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_user_inventory(db: Session, user_id: int):
    """Get user inventory."""
    return db.query(UserInventory).filter(UserInventory.user_id == user_id).all() 
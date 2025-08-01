from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    adventurer_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    level: int
    xp: int
    xp_for_next_level: int
    created_at: datetime
    last_interaction_mood: str
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    adventurer_name: str
    level: int
    xp: int
    xp_for_next_level: int
    last_interaction_mood: str

# Quest schemas
class QuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    xp_value: int = 10

class QuestCreate(QuestBase):
    pass

class Quest(QuestBase):
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Avatar schemas
class AvatarBase(BaseModel):
    head_style: str = "default"
    body_style: str = "default"
    hair_color: str = "brown"
    skin_tone: str = "medium"

class AvatarCreate(AvatarBase):
    pass

class Avatar(AvatarBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Friendship schemas
class FriendshipBase(BaseModel):
    user_two_id: int

class FriendshipCreate(FriendshipBase):
    pass

class Friendship(FriendshipBase):
    id: int
    user_one_id: int
    status: str
    action_user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Guild schemas
class GuildBase(BaseModel):
    name: str
    description: Optional[str] = None

class GuildCreate(GuildBase):
    pass

class Guild(GuildBase):
    id: int
    leader_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Guild Quest schemas
class GuildQuestBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_value: int = 100

class GuildQuestCreate(GuildQuestBase):
    pass

class GuildQuest(GuildQuestBase):
    id: int
    guild_id: int
    current_value: int
    is_completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Hero Pass schemas
class HeroPassBase(BaseModel):
    season_id: int = 1
    premium_track_unlocked: bool = False

class HeroPassCreate(HeroPassBase):
    pass

class HeroPass(HeroPassBase):
    id: int
    user_id: int
    xp_progress: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Oracle schemas
class OracleInput(BaseModel):
    message: str

class OracleAction(BaseModel):
    action: str  # CREATE_QUEST, COMPLETE_QUEST, SEARCH_INTERNET, MESSAGE
    data: dict
    message: str

# Leaderboard schemas
class LeaderboardEntry(BaseModel):
    user_id: int
    adventurer_name: str
    level: int
    xp: int
    rank: int

class Leaderboard(BaseModel):
    entries: List[LeaderboardEntry]
    timeframe: str  # daily, weekly, monthly 
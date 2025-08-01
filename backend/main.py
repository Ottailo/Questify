from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import redis
import json
from typing import List

from app.database import get_db, create_tables
from app.auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.crud import *
from app.schemas import *
from app.oracle import Oracle
from app.models import User
from app.scheduler import start_scheduler, stop_scheduler

# Initialize FastAPI app
app = FastAPI(title="Questify API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis for caching
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

# Initialize Oracle
oracle = Oracle()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Startup event
@app.on_event("startup")
async def startup_event():
    create_tables()
    start_scheduler()

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()

# Authentication endpoints
@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(db, user)
    return UserResponse(
        id=user.id,
        adventurer_name=user.adventurer_name,
        level=user.level,
        xp=user.xp,
        xp_for_next_level=user.xp_for_next_level,
        last_interaction_mood=user.last_interaction_mood
    )

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse(
        id=current_user.id,
        adventurer_name=current_user.adventurer_name,
        level=current_user.level,
        xp=current_user.xp,
        xp_for_next_level=current_user.xp_for_next_level,
        last_interaction_mood=current_user.last_interaction_mood
    )

# Quest endpoints
@app.post("/quests", response_model=Quest)
def create_user_quest(quest: QuestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new quest for the current user."""
    return create_quest(db, quest, current_user.id)

@app.get("/quests", response_model=List[Quest])
def get_quests(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all quests for the current user."""
    return get_user_quests(db, current_user.id, skip=skip, limit=limit)

@app.post("/quests/{quest_id}/complete", response_model=Quest)
def complete_user_quest(quest_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Complete a quest."""
    quest = complete_quest(db, quest_id, current_user.id)
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found or already completed")
    return quest

# Oracle endpoint
@app.post("/oracle/interact", response_model=OracleAction)
def interact_with_oracle(input_data: OracleInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Interact with The Oracle AI."""
    return oracle.interact(db, current_user.id, input_data)

# Avatar endpoints
@app.post("/avatar", response_model=Avatar)
def create_user_avatar(avatar: AvatarCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create or update user avatar."""
    return create_avatar(db, avatar, current_user.id)

@app.get("/avatar", response_model=Avatar)
def get_user_avatar(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user avatar."""
    avatar = get_user_avatar(db, current_user.id)
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    return avatar

# Friendship endpoints
@app.post("/friendships", response_model=Friendship)
def create_friendship_request(friendship: FriendshipCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a friendship request."""
    return create_friendship_request(db, current_user.id, friendship.user_two_id)

@app.post("/friendships/{friendship_id}/accept", response_model=Friendship)
def accept_friendship_request(friendship_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accept a friendship request."""
    friendship = accept_friendship(db, friendship_id, current_user.id)
    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship request not found")
    return friendship

@app.get("/friendships", response_model=List[Friendship])
def get_friendships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user friendships."""
    return get_user_friendships(db, current_user.id)

# Guild endpoints
@app.post("/guilds", response_model=Guild)
def create_guild(guild: GuildCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new guild."""
    return create_guild(db, guild, current_user.id)

@app.get("/guilds/me", response_model=Guild)
def get_user_guild(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the guild that the current user belongs to."""
    guild = get_user_guild(db, current_user.id)
    if not guild:
        raise HTTPException(status_code=404, detail="User not in a guild")
    return guild

@app.post("/guilds/{guild_id}/members", response_model=GuildMember)
def add_member_to_guild(guild_id: int, user_id: int, role: str = "member", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a member to a guild."""
    return add_guild_member(db, guild_id, user_id, role)

# Guild Quest endpoints
@app.post("/guilds/{guild_id}/quests", response_model=GuildQuest)
def create_guild_quest(guild_id: int, quest: GuildQuestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new guild quest."""
    return create_guild_quest(db, quest, guild_id)

@app.get("/guilds/{guild_id}/quests", response_model=List[GuildQuest])
def get_guild_quests(guild_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all quests for a guild."""
    return get_guild_quests(db, guild_id)

@app.post("/guild-quests/{quest_id}/progress")
def update_guild_quest_progress(quest_id: int, progress: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update guild quest progress."""
    quest = update_guild_quest_progress(db, quest_id, progress)
    if not quest:
        raise HTTPException(status_code=404, detail="Guild quest not found")
    return {"message": "Progress updated", "quest": quest}

# Leaderboard endpoint
@app.get("/leaderboard", response_model=Leaderboard)
def get_leaderboard(timeframe: str = "weekly", limit: int = 100, db: Session = Depends(get_db)):
    """Get leaderboard data."""
    # Try to get from cache first
    cache_key = f"leaderboard:{timeframe}"
    cached_data = redis_client.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    # If not in cache, calculate from database
    users = db.query(User).order_by(User.xp.desc()).limit(limit).all()
    
    entries = []
    for i, user in enumerate(users, 1):
        entries.append(LeaderboardEntry(
            user_id=user.id,
            adventurer_name=user.adventurer_name,
            level=user.level,
            xp=user.xp,
            rank=i
        ))
    
    leaderboard = Leaderboard(entries=entries, timeframe=timeframe)
    
    # Cache the result for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(leaderboard.dict()))
    
    return leaderboard

# Hero Pass endpoints
@app.get("/hero-pass", response_model=HeroPass)
def get_hero_pass(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's hero pass."""
    hero_pass = db.query(HeroPass).filter(HeroPass.user_id == current_user.id).first()
    if not hero_pass:
        hero_pass = create_hero_pass(db, current_user.id)
    return hero_pass

# WebSocket endpoint for guild chat
@app.websocket("/ws/guild-chat")
async def websocket_guild_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast(json.dumps(message))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Questify API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

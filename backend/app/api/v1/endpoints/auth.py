"""
Authentication API endpoints with secure bcrypt hashing and JWT token issuance.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.deps import get_current_user
from app.models.user import User, DigitalLifestyleProfile
from app.models.quest import Quest, QuestStatus
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class UserCreate(BaseModel):
    """User registration payload."""
    email: str
    username: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLogin(BaseModel):
    """User login payload."""
    email: str
    password: str


class TokenResponse(BaseModel):
    """Token authentication response."""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str


@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account, initialize their DLP, and return an access token."""
    try:
        # Check if email or username already exists
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A Chronicler with this email or username is already inscribed in the ledger."
            )
        
        # Hash password securely with bcrypt
        hashed_pwd = hash_password(user_data.password)
        
        new_user = User(
            email=user_data.email.strip().lower(),
            username=user_data.username.strip(),
            hashed_password=hashed_pwd,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            level=1,
            xp=0,
            wisdom_points=10,
            streak_days=1,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Initialize Digital Lifestyle Profile (DLP)
        user_dlp = DigitalLifestyleProfile(
            user_id=new_user.id,
            core_traits={"focus": 0.8, "determination": 0.7, "discipline": 0.6},
            interests={"productivity": 0.9, "skill_mastery": 0.8},
            communication_style="tactical",
            preferred_tone="supportive",
            motivation_triggers=["achievement", "mastery", "streak"],
            energy_patterns={"morning": 0.8, "afternoon": 0.7, "evening": 0.5},
            peak_performance_times=["morning"],
            difficulty_preference="moderate",
            current_goals=[]
        )
        db.add(user_dlp)
        db.commit()
        
        # Generate JWT access token
        access_token = create_access_token({"sub": str(new_user.id), "username": new_user.username})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=new_user.id,
            username=new_user.username,
            email=new_user.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user into the Guild Ledger."
        )


@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and return a signed JWT access token."""
    try:
        user = db.query(User).filter(
            (User.email == login_data.email.strip().lower()) | 
            (User.username == login_data.email.strip())
        ).first()
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Authorization rejected."
            )
        
        # Issue signed JWT
        access_token = create_access_token({"sub": str(user.id), "username": user.username})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username,
            email=user.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service encountered an unexpected error."
        )


@router.get("/me", response_model=Dict[str, Any])
async def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve full profile of the authenticated user with live telemetry."""
    try:
        total_quests = db.query(Quest).filter(Quest.user_id == current_user.id).count()
        completed_quests = db.query(Quest).filter(
            Quest.user_id == current_user.id,
            Quest.status == QuestStatus.completed
        ).count()
        active_quests = db.query(Quest).filter(
            Quest.user_id == current_user.id,
            Quest.status.in_([QuestStatus.active, QuestStatus.pending])
        ).count()
        
        completion_rate = round((completed_quests / total_quests * 100), 1) if total_quests > 0 else 0.0
        
        return {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "level": current_user.level,
            "xp": current_user.xp,
            "wisdom_points": current_user.wisdom_points,
            "streak_days": current_user.streak_days,
            "is_active": current_user.is_active,
            "total_quests": total_quests,
            "completed_quests": completed_quests,
            "active_quests": active_quests,
            "completion_rate": completion_rate,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        }
    except Exception as e:
        logger.error(f"Error retrieving user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user profile."
        )

"""
Database configuration and session management for SQLite and PostgreSQL.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_uri = settings.SQLALCHEMY_DATABASE_URI

connect_args = {}
engine_kwargs = {}

if db_uri.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL connection pooling optimizations
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

# Create database engine
engine = create_engine(
    db_uri,
    connect_args=connect_args,
    **engine_kwargs
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


async def init_db():
    """Initialize database tables and ensure demo account exists."""
    # Import all models here to ensure they are registered
    from app.models import user, quest, achievement  # noqa
    
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Ensure preloaded demo account is seeded
    try:
        from app.models.user import User, DigitalLifestyleProfile
        from app.core.security import hash_password
        db = SessionLocal()
        demo_user = db.query(User).filter(User.email == "demo@questify.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@questify.com",
                username="demouser",
                hashed_password=hash_password("demo123"),
                first_name="Demo",
                last_name="User",
                level=3,
                xp=1250,
                wisdom_points=50,
                streak_days=7,
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            
            demo_dlp = DigitalLifestyleProfile(
                user_id=demo_user.id,
                core_traits={"focus": 0.85, "determination": 0.8, "discipline": 0.75},
                interests={"productivity": 0.9, "engineering": 0.95},
                communication_style="direct",
                preferred_tone="focused",
                motivation_triggers=["streak", "mastery"],
                energy_patterns={"morning": 0.9, "afternoon": 0.7, "evening": 0.5},
                peak_performance_times=["morning"],
                difficulty_preference="normal",
                current_goals=[]
            )
            db.add(demo_dlp)
            db.commit()
        db.close()
    except Exception as e:
        print(f"[Questify DB] Warning during demo seeding: {e}")


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

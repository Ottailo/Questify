"""
Application configuration settings supporting SQLite & PostgreSQL, JWT security, and OmniRoute LLM.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "QuestSage Momentum Engine"
    VERSION: str = "3.0.0"
    DEBUG: bool = True
    
    # Database (Defaults to SQLite; auto-switches to PostgreSQL if configured)
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[str] = "5432"
    POSTGRES_DB: Optional[str] = None
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Resolve database URI for SQLite or PostgreSQL."""
        if self.DATABASE_URL:
            # Harmonize postgresql:// vs postgres:// for SQLAlchemy
            if self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            return self.DATABASE_URL
        
        if self.POSTGRES_SERVER and self.POSTGRES_DB:
            user = self.POSTGRES_USER or "postgres"
            pwd = f":{self.POSTGRES_PASSWORD}" if self.POSTGRES_PASSWORD else ""
            port = f":{self.POSTGRES_PORT}" if self.POSTGRES_PORT else ""
            return f"postgresql://{user}{pwd}@{self.POSTGRES_SERVER}{port}/{self.POSTGRES_DB}"
        
        # Canonical absolute path to questsage.db in backend directory (falls back to questify.db if exists)
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        canonical_db_path = os.path.join(backend_dir, "questsage.db").replace("\\", "/")
        if not os.path.exists(canonical_db_path) and os.path.exists(os.path.join(backend_dir, "questify.db")):
            canonical_db_path = os.path.join(backend_dir, "questify.db").replace("\\", "/")
        return f"sqlite:///{canonical_db_path}"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security (64-byte secret key for HMAC SHA256)
    SECRET_KEY: str = os.getenv(
        "QUESTSAGE_SECRET_KEY",
        os.getenv(
            "QUESTIFY_SECRET_KEY",
            "questsage_great_sage_super_secret_jwt_key_2026_production_vanguard_security"
        )
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    ALLOWED_HOSTS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "https://questsage.vercel.app",
        "https://ottailo.vercel.app",
    ]
    
    # OmniRoute LLM Settings
    OMNIROUTE_URL: str = os.getenv("OMNIROUTE_URL", "http://127.0.0.1:20129/v1")
    OMNIROUTE_API_KEY: str = os.getenv("OMNIROUTE_API_KEY", "sk-9ebfedc343ccc674-f1fdcc-800831f5")
    OMNIROUTE_MODEL: str = os.getenv("OMNIROUTE_MODEL", "infron/deepseek/deepseek-v4.1-flash")
    AI_TIMEOUT_SECONDS: int = 25
    
    # AI/ML Settings
    AI_MODEL_PATH: str = "./models"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    MAX_QUEST_LENGTH: int = 500
    MIN_CONFIDENCE_THRESHOLD: float = 0.7
    
    # Quest Generation
    MAX_QUESTS_PER_USER: int = 50
    QUEST_EXPIRY_DAYS: int = 30
    DEFAULT_QUEST_DIFFICULTY: str = "normal"
    
    # Personalization
    PROFILE_UPDATE_FREQUENCY: int = 24  # hours
    LEARNING_RATE: float = 0.01
    ADAPTATION_THRESHOLD: float = 0.8
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

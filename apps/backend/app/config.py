import json
import os
from typing import List, Union, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareNest AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Configuration (SQLite local or Supabase PostgreSQL cloud)
    DATABASE_URL: str = "sqlite:///./carenest.db"
    AUTO_SEED: bool = True
    
    # Supabase Cloud Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Authentication & Security
    SECRET_KEY: str = "carenest_super_secret_jwt_key_development_2026_elderly_care"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI Service Configuration
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_PROVIDER: str = "hybrid"  # "gemini", "openai", or "hybrid" / "clinical_rule_engine"
    
    # CORS Configuration
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def sanitize_database_url(cls, v: Optional[str]) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v or "sqlite:///./carenest.db"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        origins: List[str] = []
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("["):
                try:
                    origins = json.loads(v_stripped)
                except Exception:
                    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
            else:
                origins = [i.strip() for i in v_stripped.split(",") if i.strip()]
        elif isinstance(v, list):
            origins = v
        else:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]

        cleaned = [o.strip().rstrip("/") for o in origins if isinstance(o, str) and o.strip()]
        return cleaned or ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve .env from the project root (one level above backend/)
_env_path = Path(__file__).resolve().parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    SUPABASE_URL: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=str(_env_path), env_file_encoding="utf-8")

settings = Settings()

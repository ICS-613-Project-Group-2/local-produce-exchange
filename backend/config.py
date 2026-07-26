from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str
    SUPABASE_STORAGE_BUCKET: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

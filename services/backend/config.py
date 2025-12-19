from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # Circle API
    CIRCLE_HEADLESS_TOKEN: str
    CIRCLE_COMMUNITY_ID: str
    CIRCLE_API_URL: str = "https://app.circle.so/api/v1"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS
    FRONTEND_URL: str = "http://localhost:4321"
    
    # Translation Service
    ZEABUR_API_KEY: str = ""
    ZEABUR_ENDPOINT: str = "tokyo"  # tokyo or san_francisco
    OPENAI_API_KEY: str = ""  # Fallback to OpenAI directly if Zeabur fails
    TRANSLATION_MODEL: str = "gpt-4o"
    GITHUB_TOKEN: str = ""
    GITHUB_REPO_OWNER: str = "theaibuilders"
    GITHUB_REPO_NAME: str = "ai_builders_tutorial"
    TRANSLATION_BATCH_SIZE: int = 5
    TRANSLATION_RETRY_LIMIT: int = 3
    AUTO_TRANSLATE_ENABLED: bool = False  # Start with manual mode
    
    class Config:
        # Use .env.prod in production, .env for local development
        env_file = os.getenv("ENV_FILE", ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra fields from Doppler or other sources

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()

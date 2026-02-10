"""
Configuration settings using Pydantic
Loads from environment variables
"""
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App settings
    PROJECT_NAME: str = "Sistem Klasifikasi Arsip Surat"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True
    
    # Database settings
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/arsip_surat"
    
    # JWT settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]
    UPLOAD_DIR: str = "uploads"
    STORAGE_DIR: str = "storage"
    
    # OCR settings
    TESSERACT_CMD: str = "tesseract"  # Path to tesseract executable
    OCR_LANGUAGE: str = "ind+eng"  # Indonesian + English
    CLASSIFICATION_CONFIDENCE_THRESHOLD: float = 70.0
    
    # Redis settings (for caching and Celery)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Email settings (optional)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    
    # Google Sheets settings (optional)
    GOOGLE_CREDENTIALS_FILE: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

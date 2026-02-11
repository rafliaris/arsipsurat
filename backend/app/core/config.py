"""
Configuration settings using Pydantic
Loads from environment variables
"""
from typing import List, Union
from pydantic import field_validator
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
    
    # CORS settings - can be comma-separated string or list
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # File upload settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: Union[str, List[str]] = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
    
    @field_validator('ALLOWED_FILE_TYPES', mode='before')
    @classmethod
    def parse_allowed_file_types(cls, v):
        """Parse ALLOWED_FILE_TYPES from comma-separated string or list"""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(',') if ext.strip()]
        return v
    
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
        env_file_encoding = 'utf-8'
        case_sensitive = True


# Create settings instance
settings = Settings()

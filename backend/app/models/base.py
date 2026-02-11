"""
Base model with common fields for all models
"""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class BaseModel(Base):
    """
    Abstract base model with common fields
    All models should inherit from this
    """
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime, nullable=True)  # For soft delete
    
    def soft_delete(self):
        """Soft delete this record"""
        self.deleted_at = datetime.utcnow()
    
    def is_deleted(self):
        """Check if record is soft deleted"""
        return self.deleted_at is not None

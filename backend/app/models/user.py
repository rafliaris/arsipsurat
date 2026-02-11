"""
User model
"""
from sqlalchemy import Column, String, Boolean
from app.models.base import BaseModel


class User(BaseModel):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="staff")  # admin, staff, viewer
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<User {self.username}>"

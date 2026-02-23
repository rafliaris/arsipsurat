"""
Pydantic schemas for User endpoints
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=6)
    role: str = Field(default="staff", pattern="^(admin|staff|viewer)$")


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChangePasswordRequest(BaseModel):
    """Schema for changing password (authenticated users)"""
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (min 6 characters)")


class AdminResetPasswordRequest(BaseModel):
    """Schema for admin resetting user password"""
    new_password: Optional[str] = Field(None, min_length=6, description="New password, auto-generated if not provided")
    force_change_on_login: bool = Field(default=False, description="Require password change on next login")


class PasswordChangeResponse(BaseModel):
    """Schema for password change response"""
    message: str
    temporary_password: Optional[str] = None  # Only for admin reset

"""
Settings Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.setting import SettingType


class SettingResponse(BaseModel):
    """Response schema for setting"""
    id: int
    setting_key: str
    setting_value: Optional[str]
    setting_type: SettingType
    description: Optional[str]
    is_public: bool
    updated_by: Optional[int]
    updated_at: datetime
    
    class Config:
        from_attributes = True
        use_enum_values = True


class SettingUpdate(BaseModel):
    """Schema for updating a setting"""
    setting_value: str = Field(..., min_length=0)
    
    class Config:
        use_enum_values = True


class SettingList(BaseModel):
    """Lightweight schema for listing settings"""
    setting_key: str
    setting_value: Optional[str]
    description: Optional[str]
    is_public: bool
    
    class Config:
        from_attributes = True

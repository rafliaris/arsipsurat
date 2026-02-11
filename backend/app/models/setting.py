"""
Settings Model
Stores application configuration
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class SettingType(str, enum.Enum):
    """Setting value type enum"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    JSON = "json"


class Setting(BaseModel):
    """
    Application settings model
    Stores configuration that can be changed at runtime
    """
    __tablename__ = "settings"
    
    # Setting key (unique identifier)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    
    # Setting value (stored as text, cast based on setting_type)
    setting_value = Column(Text, nullable=True)
    
    # Type of setting
    setting_type = Column(Enum(SettingType), default=SettingType.STRING, nullable=False)
    
    # Metadata
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)  # Can non-admin read?
    
    # Audit
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updated_by_user = relationship("User", backref="settings_updated")
    
    def __repr__(self):
        return f"<Setting(key='{self.setting_key}', value='{self.setting_value}', type='{self.setting_type}')>"

"""
Settings API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.setting import Setting
from app.models.user import User
from app.schemas.setting import SettingResponse, SettingUpdate, SettingList
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings")


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/public", response_model=List[SettingList])
def get_public_settings(
    db: Session = Depends(get_db),
):
    """
    Get public settings (no authentication required)
    Returns settings where is_public = TRUE
    """
    settings = db.query(Setting).filter(
        Setting.is_public == True,
        Setting.deleted_at == None
    ).all()
    
    return settings


@router.get("", response_model=List[SettingResponse])
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    List all settings (Admin only)
    """
    settings = db.query(Setting).filter(
        Setting.deleted_at == None
    ).order_by(Setting.setting_key).all()
    
    return settings


@router.get("/{setting_key}", response_model=SettingResponse)
def get_setting(
    setting_key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a specific setting
    Public settings: anyone can view
    Private settings: admin only
    """
    setting = db.query(Setting).filter(
        Setting.setting_key == setting_key,
        Setting.deleted_at == None
    ).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    # Check permission for private settings
    if not setting.is_public and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for this setting"
        )
    
    return setting


@router.put("/{setting_key}", response_model=SettingResponse)
def update_setting(
    setting_key: str,
    setting_update: SettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Update a setting value (Admin only)
    """
    setting = db.query(Setting).filter(
        Setting.setting_key == setting_key,
        Setting.deleted_at == None
    ).first()
    
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    # Update value
    setting.setting_value = setting_update.setting_value
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    return setting


@router.post("/reset", status_code=status.HTTP_200_OK)
def reset_to_defaults(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Reset all settings to default values (Admin only)
    Re-runs the seed migration logic
    """
    # This would need to read from the seed migration
    # For now, return a message
    return {
        "message": "To reset settings, run: alembic downgrade -1 && alembic upgrade head"
    }

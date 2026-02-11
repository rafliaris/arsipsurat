"""
Notification API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.notifikasi import Notifikasi, TipeNotifikasi
from app.schemas.notifikasi import NotifikasiResponse, NotifikasiList, NotificationStats
from app.api.deps import get_current_user
from datetime import datetime

router = APIRouter(prefix="/notifications")


@router.get("", response_model=List[NotifikasiList])
def list_notifications(
    skip: int = 0,
    limit: int = 20,
    is_read: Optional[bool] = None,
    tipe: Optional[TipeNotifikasi] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    List notifications for current user
    """
    query = db.query(Notifikasi).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.deleted_at == None
    )
    
    # Filter by read status
    if is_read is not None:
        query = query.filter(Notifikasi.is_read == is_read)
    
    # Filter by type
    if tipe:
        query = query.filter(Notifikasi.tipe == tipe)
    
    # Order by newest first
    query = query.order_by(Notifikasi.created_at.desc())
    
    notifications = query.offset(skip).limit(limit).all()
    return notifications


@router.get("/stats", response_model=NotificationStats)
def get_notification_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get notification statistics for current user
    """
    # Total count
    total = db.query(func.count(Notifikasi.id)).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.deleted_at == None
    ).scalar()
    
    # Unread count
    unread = db.query(func.count(Notifikasi.id)).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.is_read == False,
        Notifikasi.deleted_at == None
    ).scalar()
    
    # Count by type
    by_type_query = db.query(
        Notifikasi.tipe,
        func.count(Notifikasi.id)
    ).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.deleted_at == None
    ).group_by(Notifikasi.tipe).all()
    
    by_type = {str(tipe): count for tipe, count in by_type_query}
    
    return NotificationStats(
        total=total,
        unread=unread,
        by_type=by_type
    )


@router.get("/{notification_id}", response_model=NotifikasiResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get notification detail"""
    notification = db.query(Notifikasi).filter(
        Notifikasi.id == notification_id,
        Notifikasi.deleted_at == None
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check permission (user can only view their own notifications)
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this notification"
        )
    
    return notification


@router.put("/{notification_id}/read", response_model=NotifikasiResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Mark notification as read
    """
    notification = db.query(Notifikasi).filter(
        Notifikasi.id == notification_id,
        Notifikasi.deleted_at == None
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check permission
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Mark as read
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        db.refresh(notification)
    
    return notification


@router.put("/read-all", status_code=status.HTTP_200_OK)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Mark all notifications as read for current user
    """
    db.query(Notifikasi).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.is_read == False,
        Notifikasi.deleted_at == None
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Soft delete notification
    """
    notification = db.query(Notifikasi).filter(
        Notifikasi.id == notification_id,
        Notifikasi.deleted_at == None
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check permission
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Soft delete
    notification.soft_delete()
    db.commit()
    
    return None

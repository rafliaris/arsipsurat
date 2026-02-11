"""
Audit Log API Endpoints
Admin-only access for viewing audit trail
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse, AuditLogList, AuditLogStats
from app.api.deps import get_current_user

router = APIRouter(prefix="/audit")


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("", response_model=List[AuditLogList])
def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    action: Optional[str] = None,
    table_name: Optional[str] = None,
    user_id: Optional[int] = None,
    days: int = Query(30, ge=1, le=365),  # Last N days
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    List audit logs (Admin only)
    Filter by action, table, user, and time range
    """
    # Date range
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(AuditLog).filter(
        AuditLog.created_at >= cutoff_date
    )
    
    # Filters
    if action:
        query = query.filter(AuditLog.action == action)
    
    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    # Order by newest first
    query = query.order_by(desc(AuditLog.created_at))
    
    logs = query.offset(skip).limit(limit).all()
    return logs


@router.get("/stats", response_model=AuditLogStats)
def get_audit_stats(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get audit log statistics (Admin only)
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Total count
    total = db.query(func.count(AuditLog.id)).filter(
        AuditLog.created_at >= cutoff_date
    ).scalar() or 0
    
    # By action
    by_action_query = db.query(
        AuditLog.action,
        func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= cutoff_date
    ).group_by(AuditLog.action).all()
    
    by_action = {action: count for action, count in by_action_query}
    
    # By table
    by_table_query = db.query(
        AuditLog.table_name,
        func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= cutoff_date,
        AuditLog.table_name != None
    ).group_by(AuditLog.table_name).all()
    
    by_table = {table: count for table, count in by_table_query}
    
    # By user
    by_user_query = db.query(
        AuditLog.user_id,
        func.count(AuditLog.id)
    ).filter(
        AuditLog.created_at >= cutoff_date,
        AuditLog.user_id != None
    ).group_by(AuditLog.user_id).all()
    
    by_user = {f"user_{user_id}": count for user_id, count in by_user_query}
    
    return AuditLogStats(
        total=total,
        by_action=by_action,
        by_table=by_table,
        by_user=by_user,
    )


@router.get("/{audit_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get audit log detail (Admin only)
    Shows full old_data and new_data JSON
    """
    audit_log = db.query(AuditLog).filter(
        AuditLog.id == audit_id
    ).first()
    
    if not audit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found"
        )
    
    return audit_log


@router.get("/user/{user_id}", response_model=List[AuditLogList])
def get_user_audit_logs(
    user_id: int,
    skip: int = 0,
    limit:int = 50,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Get all audit logs for a specific user (Admin only)
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    logs = db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.created_at >= cutoff_date
    ).order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    
    return logs

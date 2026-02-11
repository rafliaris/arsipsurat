"""
Audit Service
Handles creation and management of audit logs
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User


class AuditService:
    """Service for creating and managing audit logs"""
    
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        table_name: Optional[str] = None,
        record_id: Optional[int] = None,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        description: Optional[str] = None,
    ) -> AuditLog:
        """
        Create an audit log entry
        
        Args:
            db: Database session
            action: Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
            user_id: ID of user who performed action
            table_name: Name of table affected
            record_id: ID of affected record
            old_data: Data before change (for UPDATE/DELETE)
            new_data: Data after change (for CREATE/UPDATE)
            ip_address: Client IP address
            user_agent: Client user agent
            endpoint: API endpoint called
            method: HTTP method
            description: Human-readable description
        
        Returns:
            Created AuditLog instance
        """
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_data=old_data,
            new_data=new_data,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            method=method,
            description=description,
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    
    @staticmethod
    def log_login(
        db: Session,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
    ) -> AuditLog:
        """Log a login attempt"""
        action = "LOGIN_SUCCESS" if success else "LOGIN_FAILED"
        description = f"User login {'successful' if success else 'failed'}"
        
        return AuditService.log_action(
            db=db,
            action=action,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            description=description,
        )
    
    @staticmethod
    def log_create(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log a CREATE operation"""
        return AuditService.log_action(
            db=db,
            action="CREATE",
            user_id=user_id,
            table_name=table_name,
            record_id=record_id,
            new_data=data,
            ip_address=ip_address,
            user_agent=user_agent,
            description=f"Created {table_name} record #{record_id}",
        )
    
    @staticmethod
    def log_update(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        old_data: Dict[str, Any],
        new_data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log an UPDATE operation"""
        return AuditService.log_action(
            db=db,
            action="UPDATE",
            user_id=user_id,
            table_name=table_name,
            record_id=record_id,
            old_data=old_data,
            new_data=new_data,
            ip_address=ip_address,
            user_agent=user_agent,
            description=f"Updated {table_name} record #{record_id}",
        )
    
    @staticmethod
    def log_delete(
        db: Session,
        user_id: int,
        table_name: str,
        record_id: int,
        data: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Log a DELETE operation"""
        return AuditService.log_action(
            db=db,
            action="DELETE",
            user_id=user_id,
            table_name=table_name,
            record_id=record_id,
            old_data=data,
            ip_address=ip_address,
            user_agent=user_agent,
            description=f"Deleted {table_name} record #{record_id}",
        )

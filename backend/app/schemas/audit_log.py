"""
Audit Log Pydantic Schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class AuditLogResponse(BaseModel):
    """Response schema for audit log"""
    id: int
    user_id: Optional[int]
    action: str
    table_name: Optional[str]
    record_id: Optional[int]
    old_data: Optional[Dict[str, Any]]
    new_data: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    endpoint: Optional[str]
    method: Optional[str]
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditLogList(BaseModel):
    """Lightweight schema for listing audit logs"""
    id: int
    user_id: Optional[int]
    action: str
    table_name: Optional[str]
    record_id: Optional[int]
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditLogStats(BaseModel):
    """Audit log statistics"""
    total: int
    by_action: Dict[str, int]
    by_table: Dict[str, int]
    by_user: Dict[str, int]

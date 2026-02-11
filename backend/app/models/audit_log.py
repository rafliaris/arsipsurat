"""
Audit Log Model
Tracks all CRUD operations for compliance and security
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AuditLog(BaseModel):
    """
    Audit log for tracking all system actions
    Stores who did what, when, and what changed
    """
    __tablename__ = "audit_logs"
    
    # User who performed the action
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Action details
    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE, LOGIN, etc.
    table_name = Column(String(50), nullable=True, index=True)  # Table affected
    record_id = Column(Integer, nullable=True)  # ID of affected record
    
    # Data changes (JSON)
    old_data = Column(JSON, nullable=True)  # State before change
    new_data = Column(JSON, nullable=True)  # State after change
    
    # Request metadata
    ip_address = Column(String(45), nullable=True)  # Support IPv6
    user_agent = Column(String(255), nullable=True)
    endpoint = Column(String(255), nullable=True)  # API endpoint called
    method = Column(String(10), nullable=True)  # HTTP method (GET, POST, etc.)
    
    # Additional context
    description = Column(Text, nullable=True)  # Human-readable description
    
    # Relationships
    user = relationship("User", backref="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', user_id={self.user_id}, table='{self.table_name}')>"

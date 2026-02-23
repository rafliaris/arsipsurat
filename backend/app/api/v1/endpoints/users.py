"""
Users Management API Endpoints
Admin-only routes for managing system users
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    AdminResetPasswordRequest,
    PasswordChangeResponse,
)
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter(prefix="/users")


# ─────────────────────────────────────────────────────────────
# LIST USERS
# ─────────────────────────────────────────────────────────────

@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
    role: Optional[str] = Query(default=None, description="Filter by role: admin, staff, viewer"),
    is_active: Optional[bool] = Query(default=None, description="Filter by active status"),
    search: Optional[str] = Query(default=None, description="Search by username, email, or full name"),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    List all users (Admin only).
    Supports filtering by role, active status, and search.
    """
    query = db.query(User).filter(User.deleted_at == None)

    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            User.username.ilike(search_term) |
            User.email.ilike(search_term) |
            User.full_name.ilike(search_term)
        )

    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users


@router.get("/count")
def count_users(
    role: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Get total user count (Admin only).
    """
    from sqlalchemy import func
    query = db.query(func.count(User.id)).filter(User.deleted_at == None)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    total = query.scalar() or 0
    return {"total": total}


# ─────────────────────────────────────────────────────────────
# GET SINGLE USER
# ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's own profile.
    Available to all authenticated users.
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Get a specific user by ID (Admin only).
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


# ─────────────────────────────────────────────────────────────
# CREATE USER
# ─────────────────────────────────────────────────────────────

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new user (Admin only).
    """
    # Check duplicate username
    if db.query(User).filter(User.username == data.username, User.deleted_at == None).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{data.username}' is already taken"
        )

    # Check duplicate email
    if db.query(User).filter(User.email == data.email, User.deleted_at == None).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email '{data.email}' is already registered"
        )

    admin_id = current_user.id
    admin_username = current_user.username

    new_user = User(
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        role=data.role,
        hashed_password=get_password_hash(data.password),
        is_active=True,
    )
    db.add(new_user)

    db.flush()  # get new_user.id

    db.add(AuditLog(
        user_id=admin_id,
        action="CREATE",
        table_name="users",
        record_id=new_user.id,
        description=f"Admin {admin_username} created user {new_user.username} with role {new_user.role}",
    ))
    db.commit()
    db.refresh(new_user)
    return new_user


# ─────────────────────────────────────────────────────────────
# UPDATE USER
# ─────────────────────────────────────────────────────────────

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Update user details (Admin only).
    Supports partial updates - only provide fields you want to change.
    """
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check email conflict
    if data.email and data.email != user.email:
        if db.query(User).filter(User.email == data.email, User.deleted_at == None, User.id != user_id).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{data.email}' is already registered"
            )

    # Validate role
    if data.role and data.role not in ("admin", "staff", "viewer"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be one of: admin, staff, viewer"
        )

    # Cache for audit log
    admin_id = current_user.id
    admin_username = current_user.username
    target_username = user.username

    # Apply updates
    if data.email is not None:
        user.email = data.email
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active

    db.add(AuditLog(
        user_id=admin_id,
        action="UPDATE",
        table_name="users",
        record_id=user_id,
        description=f"Admin {admin_username} updated user {target_username}",
    ))
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────────────
# TOGGLE ACTIVE / DEACTIVATE
# ─────────────────────────────────────────────────────────────

@router.put("/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Toggle user active/inactive status (Admin only).
    Admins cannot deactivate themselves.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    admin_id = current_user.id
    admin_username = current_user.username
    target_username = user.username

    user.is_active = not user.is_active
    action = "activated" if user.is_active else "deactivated"

    db.add(AuditLog(
        user_id=admin_id,
        action="UPDATE",
        table_name="users",
        record_id=user_id,
        description=f"Admin {admin_username} {action} user {target_username}",
    ))
    db.commit()
    db.refresh(user)
    return user


# ─────────────────────────────────────────────────────────────
# RESET PASSWORD (moved from auth.py for better organization)
# ─────────────────────────────────────────────────────────────

@router.post("/{user_id}/reset-password", response_model=PasswordChangeResponse)
def admin_reset_user_password(
    user_id: int,
    request: AdminResetPasswordRequest,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Reset a user's password (Admin only).
    Provide `new_password` or leave empty to auto-generate a temporary password.
    """
    target_user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    from app.services.password_service import PasswordService

    if request.new_password:
        if len(request.new_password) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 6 characters long"
            )
        new_password = request.new_password
        temporary_password = None
    else:
        new_password = PasswordService.generate_temporary_password()
        temporary_password = new_password

    admin_id = current_user.id
    admin_username = current_user.username
    target_username = target_user.username

    target_user.hashed_password = get_password_hash(new_password)

    db.add(AuditLog(
        user_id=admin_id,
        action="admin_password_reset",
        table_name="users",
        record_id=user_id,
        description=f"Admin {admin_username} reset password for user {target_username}",
    ))
    db.commit()

    return {
        "message": f"Password reset successfully for user {target_username}",
        "temporary_password": temporary_password,
    }


# ─────────────────────────────────────────────────────────────
# DELETE USER (soft delete)
# ─────────────────────────────────────────────────────────────

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db),
):
    """
    Soft-delete a user (Admin only).
    Admins cannot delete themselves.
    """
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    admin_id = current_user.id
    admin_username = current_user.username
    target_username = user.username

    user.soft_delete()

    db.add(AuditLog(
        user_id=admin_id,
        action="DELETE",
        table_name="users",
        record_id=user_id,
        description=f"Admin {admin_username} deleted user {target_username}",
    ))
    db.commit()

    return {"message": f"User '{target_username}' has been deleted successfully"}

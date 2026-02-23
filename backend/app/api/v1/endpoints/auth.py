"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserResponse,
    ChangePasswordRequest,
    AdminResetPasswordRequest,
    PasswordChangeResponse,
)

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_password_hash,
)
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login endpoint - accepts username OR email
    Returns access token and refresh token
    """
    # Try to find user by username first
    user = db.query(User).filter(
        User.username == form_data.username,
        User.deleted_at == None
    ).first()
    
    # If not found by username, try by email
    if not user:
        user = db.query(User).filter(
            User.email == form_data.username,
            User.deleted_at == None
        ).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout endpoint
    Note: JWT tokens are stateless, so we just return success
    Frontend should delete the stored tokens
    """
    return {"message": "Successfully logged out"}


@router.put("/change-password", response_model=PasswordChangeResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change password for authenticated user
    Requires current password verification
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if request.new_password == request.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password"
        )
    
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Cache attributes before commit to avoid DetachedInstanceError
    user_id = current_user.id
    username = current_user.username
    
    # Update password
    current_user.hashed_password = get_password_hash(request.new_password)
    
    # Log audit trail in same transaction before commit
    from app.models.audit_log import AuditLog
    audit = AuditLog(
        user_id=user_id,
        action="password_change",
        table_name="users",
        record_id=user_id,
        description=f"User {username} changed their password"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/users/{user_id}/reset-password", response_model=PasswordChangeResponse)
async def admin_reset_password(
    user_id: int,
    request: AdminResetPasswordRequest,
    admin_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to reset any user's password
    Can generate temporary password or accept new password
    """
    # Get target user
    target_user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at == None
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate or use provided password
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
    
    # Cache attributes before commit to avoid DetachedInstanceError
    admin_id = admin_user.id
    admin_username = admin_user.username
    target_username = target_user.username
    
    # Update password and log audit in same transaction
    target_user.hashed_password = get_password_hash(new_password)
    
    from app.models.audit_log import AuditLog
    audit = AuditLog(
        user_id=admin_id,
        action="admin_password_reset",
        table_name="users",
        record_id=user_id,
        description=f"Admin {admin_username} reset password for user {target_username}"
    )
    db.add(audit)
    db.commit()
    
    return {
        "message": f"Password reset successfully for user {target_username}",
        "temporary_password": temporary_password
    }

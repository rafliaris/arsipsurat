"""
File Service
Handles file uploads, storage, and management
"""
import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings


class FileService:
    """Service for file operations"""
    
    @staticmethod
    def validate_file(file: UploadFile) -> None:
        """
        Validate uploaded file
        Raises HTTPException if validation fails
        """
        # Check file type
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is required"
            )
        
        # Get file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
    
    @staticmethod
    def generate_storage_path(file_type: str, date: Optional[datetime] = None) -> Path:
        """
        Generate storage path based on file type and date
        Structure: storage/{file_type}/{year}/{month}/
        """
        if date is None:
            date = datetime.now()
        
        year = str(date.year)
        month = f"{date.month:02d}"
        
        storage_path = Path(settings.STORAGE_DIR) / file_type / year / month
        storage_path.mkdir(parents=True, exist_ok=True)
        
        return storage_path
    
    @staticmethod
    def generate_unique_filename(original_filename: str) -> str:
        """
        Generate unique filename using UUID
        Preserves original extension
        """
        file_ext = Path(original_filename).suffix.lower()
        unique_name = f"{uuid.uuid4()}{file_ext}"
        return unique_name
    
    @staticmethod
    async def save_upload_file(
        upload_file: UploadFile,
        file_type: str = "surat_masuk",
        date: Optional[datetime] = None
    ) -> Tuple[str, str, int]:
        """
        Save uploaded file to storage
        
        Args:
            upload_file: FastAPI UploadFile object
            file_type: Type of file (surat_masuk, surat_keluar, etc.)
            date: Date for organizing files (default: now)
        
        Returns:
            Tuple of (file_path, mime_type, file_size)
        
        Raises:
            HTTPException if save fails
        """
        try:
            # Validate file
            FileService.validate_file(upload_file)
            
            # Generate storage path and filename
            storage_path = FileService.generate_storage_path(file_type, date)
            unique_filename = FileService.generate_unique_filename(upload_file.filename)
            file_path = storage_path / unique_filename
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
            
            # Get file info
            file_size = file_path.stat().st_size
            mime_type = upload_file.content_type or "application/octet-stream"
            
            # Return relative path from project root (resolve both to absolute first)
            relative_path = str(file_path.resolve().relative_to(Path.cwd().resolve()))
            # Normalize to forward slashes for consistency
            relative_path = relative_path.replace("\\", "/")
            
            return (relative_path, mime_type, file_size)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
    
    @staticmethod
    def delete_file(file_path: str) -> bool:
        """
        Delete file from storage
        
        Args:
            file_path: Relative path to file
        
        Returns:
            True if deleted, False if file doesn't exist
        """
        try:
            full_path = Path(file_path)
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
    
    @staticmethod
    def get_file_path(relative_path: str) -> Path:
        """
        Get full file path from relative path
        
        Args:
            relative_path: Relative path from project root
        
        Returns:
            Full Path object
        """
        return Path(relative_path)
    
    @staticmethod
    def file_exists(file_path: str) -> bool:
        """Check if file exists"""
        return Path(file_path).exists()


# Create singleton instance
file_service = FileService()

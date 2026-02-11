"""
Services package
Exports all service instances
"""
from app.services.file_service import file_service, FileService
from app.services.ocr_service import ocr_service, OCRService

__all__ = [
    "file_service",
    "FileService",
    "ocr_service",
    "OCRService",
]

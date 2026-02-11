"""
Notifikasi Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.notifikasi import TipeNotifikasi


class NotifikasiBase(BaseModel):
    """Base schema for Notifikasi"""
    judul: str = Field(..., min_length=1, max_length=255)
    pesan: str = Field(..., min_length=1)
    tipe: TipeNotifikasi
    link: Optional[str] = Field(None, max_length=500)


class NotifikasiCreate(BaseModel):
    """Schema for creating Notifikasi"""
    user_id: int
    tipe: TipeNotifikasi
    judul: str = Field(..., min_length=1, max_length=255)
    pesan: str = Field(..., min_length=1)
    link: Optional[str] = Field(None, max_length=500)
    surat_masuk_id: Optional[int] = None
    surat_keluar_id: Optional[int] = None
    disposisi_id: Optional[int] = None
    
    class Config:
        use_enum_values = True


class NotifikasiResponse(NotifikasiBase):
    """Full response schema for Notifikasi"""
    id: int
    user_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    surat_masuk_id: Optional[int] = None
    surat_keluar_id: Optional[int] = None
    disposisi_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        use_enum_values = True


class NotifikasiList(BaseModel):
    """Lightweight schema for listing Notifikasi"""
    id: int
    tipe: str
    judul: str
    pesan: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationStats(BaseModel):
    """Statistics for notifications"""
    total: int
    unread: int
    by_type: dict

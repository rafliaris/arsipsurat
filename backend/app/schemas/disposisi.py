"""
Disposisi Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.disposisi import StatusDisposisi


class DisposisiBase(BaseModel):
    """Base schema for Disposisi"""
    to_user_id: int = Field(..., description="User ID to route to")
    catatan: Optional[str] = None
    instruksi: Optional[str] = None
    batas_waktu: Optional[date] = None


class DisposisiCreate(DisposisiBase):
    """Schema for creating Disposisi"""
    surat_masuk_id: Optional[int] = None
    surat_keluar_id: Optional[int] = None
    
    class Config:
        use_enum_values = True


class DisposisiUpdate(BaseModel):
    """Schema for updating Disposisi"""
    catatan: Optional[str] = None
    instruksi: Optional[str] = None
    batas_waktu: Optional[date] = None
    status: Optional[StatusDisposisi] = None
    keterangan_selesai: Optional[str] = None
    
    class Config:
        use_enum_values = True


class DisposisiResponse(DisposisiBase):
    """Response schema for Disposisi"""
    id: int
    surat_masuk_id: Optional[int] = None
    surat_keluar_id: Optional[int] = None
    from_user_id: int
    status: str
    tanggal_selesai: Optional[datetime] = None
    keterangan_selesai: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

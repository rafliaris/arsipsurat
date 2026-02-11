"""
Surat Keluar Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.surat_masuk import StatusSurat, PrioritySurat  # Reuse enums


class SuratKeluarBase(BaseModel):
    """Base schema for Surat Keluar"""
    tanggal_surat: date
    penerima: str = Field(..., min_length=1, max_length=255)
    tembusan: Optional[str] = None
    perihal: str = Field(..., min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    status: StatusSurat = Field(default=StatusSurat.BARU)
    priority: PrioritySurat = Field(default=PrioritySurat.SEDANG)


class SuratKeluarCreate(BaseModel):
    """Schema for creating Surat Keluar"""
    tanggal_surat: date
    penerima: str = Field(..., min_length=1, max_length=255)
    tembusan: Optional[str] = None
    perihal: str = Field(..., min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    priority: PrioritySurat = Field(default=PrioritySurat.SEDANG)
    
    class Config:
        use_enum_values = True


class SuratKeluarUpdate(BaseModel):
    """Schema for updating Surat Keluar"""
    tanggal_surat: Optional[date] = None
    penerima: Optional[str] = Field(None, min_length=1, max_length=255)
    tembusan: Optional[str] = None
    perihal: Optional[str] = Field(None, min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    status: Optional[StatusSurat] = None
    priority: Optional[PrioritySurat] = None
    
    class Config:
        use_enum_values = True


class SuratKeluarResponse(SuratKeluarBase):
    """Full response schema for Surat Keluar"""
    id: int
    nomor_surat_keluar: str  # Auto-generated
    file_path: str
    file_type: str
    file_size: int
    original_filename: str
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    keywords: Optional[List[str]] = None
    created_by: int
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        use_enum_values = True


class SuratKeluarList(BaseModel):
    """Lightweight schema for listing Surat Keluar"""
    id: int
    nomor_surat_keluar: str
    tanggal_surat: date
    penerima: str
    perihal: str
    kategori_id: Optional[int] = None
    status: str
    priority: str
    created_at: datetime
    
    class Config:
        from_attributes = True

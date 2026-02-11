"""
Surat Masuk Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.surat_masuk import StatusSurat, PrioritySurat


class SuratMasukBase(BaseModel):
    """Base schema for Surat Masuk"""
    nomor_surat: str = Field(..., min_length=1, max_length=100)
    tanggal_surat: date
    tanggal_terima: date
    pengirim: str = Field(..., min_length=1, max_length=255)
    perihal: str = Field(..., min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    status: StatusSurat = Field(default=StatusSurat.BARU)
    priority: PrioritySurat = Field(default=PrioritySurat.SEDANG)


class SuratMasukCreate(BaseModel):
    """Schema for creating Surat Masuk (file handled separately)"""
    nomor_surat: str = Field(..., min_length=1, max_length=100)
    tanggal_surat: date
    tanggal_terima: date
    pengirim: str = Field(..., min_length=1, max_length=255)
    perihal: str = Field(..., min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    priority: PrioritySurat = Field(default=PrioritySurat.SEDANG)
    
    class Config:
        use_enum_values = True


class SuratMasukUpdate(BaseModel):
    """Schema for updating Surat Masuk"""
    nomor_surat: Optional[str] = Field(None, min_length=1, max_length=100)
    tanggal_surat: Optional[date] = None
    tanggal_terima: Optional[date] = None
    pengirim: Optional[str] = Field(None, min_length=1, max_length=255)
    perihal: Optional[str] = Field(None, min_length=1, max_length=500)
    isi_singkat: Optional[str] = None
    kategori_id: Optional[int] = None
    status: Optional[StatusSurat] = None
    priority: Optional[PrioritySurat] = None
    
    class Config:
        use_enum_values = True


class SuratMasukResponse(SuratMasukBase):
    """Full response schema for Surat Masuk"""
    id: int
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


class SuratMasukList(BaseModel):
    """Lightweight schema for listing Surat Masuk"""
    id: int
    nomor_surat: str
    tanggal_surat: date
    tanggal_terima: date
    pengirim: str
    perihal: str
    kategori_id: Optional[int] = None
    status: str
    priority: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class SuratMasukFilter(BaseModel):
    """Schema for filtering Surat Masuk"""
    search: Optional[str] = Field(None, description="Search in nomor, pengirim, perihal")
    kategori_id: Optional[int] = None
    status: Optional[StatusSurat] = None
    priority: Optional[PrioritySurat] = None
    tanggal_mulai: Optional[date] = None
    tanggal_akhir: Optional[date] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    
    class Config:
        use_enum_values = True


class OCRResult(BaseModel):
    """Schema for OCR processing result"""
    text: str
    confidence: float = Field(..., ge=0, le=100)
    keywords: List[str]
    suggested_kategori_id: Optional[int] = None

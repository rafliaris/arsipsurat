"""
Kategori Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class KategoriBase(BaseModel):
    """Base schema for Kategori"""
    nama: str = Field(..., min_length=1, max_length=100, description="Category name")
    kode: str = Field(..., min_length=1, max_length=20, description="Category code")
    deskripsi: Optional[str] = Field(None, max_length=255, description="Category description")
    color: str = Field(default="#6B7280", pattern="^#[0-9A-Fa-f]{6}$", description="Hex color code")
    is_active: bool = Field(default=True, description="Is category active")


class KategoriCreate(KategoriBase):
    """Schema for creating a new Kategori"""
    pass


class KategoriUpdate(BaseModel):
    """Schema for updating a Kategori (all fields optional)"""
    nama: Optional[str] = Field(None, min_length=1, max_length=100)
    kode: Optional[str] = Field(None, min_length=1, max_length=20)
    deskripsi: Optional[str] = Field(None, max_length=255)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    is_active: Optional[bool] = None


class KategoriResponse(KategoriBase):
    """Schema for Kategori response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # For Pydantic v2 (was orm_mode in v1)


class KategoriList(BaseModel):
    """Schema for listing categories (lightweight)"""
    id: int
    nama: str
    kode: str
    color: str
    is_active: bool
    
    class Config:
        from_attributes = True

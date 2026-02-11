"""
Kategori (Category) Model
Master data for letter categorization
"""
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Kategori(BaseModel):
    """
    Letter category model
    Used for both surat masuk and surat keluar
    """
    __tablename__ = "kategori"
    
    # Basic Info
    nama = Column(String(100), nullable=False, unique=True)  # e.g., "Undangan"
    kode = Column(String(20), nullable=False, unique=True)   # e.g., "UND"
    deskripsi = Column(String(255), nullable=True)
    
    # UI Display
    color = Column(String(20), nullable=False, default="#6B7280")  # Hex color for badges
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    surat_masuk = relationship("SuratMasuk", back_populates="kategori", lazy="dynamic")
    surat_keluar = relationship("SuratKeluar", back_populates="kategori", lazy="dynamic")
    
    def __repr__(self):
        return f"<Kategori(id={self.id}, nama='{self.nama}', kode='{self.kode}')>"

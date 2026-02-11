"""
Surat Masuk (Incoming Mail) Model
"""
from sqlalchemy import Column, String, Text, Integer, Date, DateTime, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class StatusSurat(str, enum.Enum):
    """Status enum for surat"""
    BARU = "baru"
    PROSES = "proses"
    SELESAI = "selesai"
    ARSIP = "arsip"


class PrioritySurat(str, enum.Enum):
    """Priority enum for surat"""
    RENDAH = "rendah"
    SEDANG = "sedang"
    TINGGI = "tinggi"
    URGENT = "urgent"


class SuratMasuk(BaseModel):
    """
    Incoming mail model
    Stores information about letters received by the organization
    """
    __tablename__ = "surat_masuk"
    
    # Letter Info
    nomor_surat = Column(String(100), nullable=False, index=True)  # Letter number from sender
    tanggal_surat = Column(Date, nullable=False, index=True)  # Date on the letter
    tanggal_terima = Column(Date, nullable=False, index=True)  # Date received
    pengirim = Column(String(255), nullable=False, index=True)  # Sender name/organization
    
    # Content
    perihal = Column(String(500), nullable=False)  # Subject/regarding
    isi_singkat = Column(Text, nullable=True)  # Brief content summary
    
    # Categorization
    kategori_id = Column(Integer, ForeignKey("kategori.id"), nullable=True, index=True)
    
    # File Information
    file_path = Column(String(500), nullable=False)  # Path to stored file
    file_type = Column(String(50), nullable=False)  # MIME type
    file_size = Column(Integer, nullable=False)  # File size in bytes
    original_filename = Column(String(255), nullable=False)  # Original uploaded filename
    
    # OCR Results
    ocr_text = Column(Text, nullable=True)  # Extracted text from OCR
    ocr_confidence = Column(Float, nullable=True)  # OCR confidence score (0-100)
    keywords = Column(JSON, nullable=True)  # Extracted keywords as JSON array
    
    # Status and Priority
    status = Column(Enum(StatusSurat), default=StatusSurat.BARU, nullable=False, index=True)
    priority = Column(Enum(PrioritySurat), default=PrioritySurat.SEDANG, nullable=False, index=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    kategori = relationship("Kategori", back_populates="surat_masuk")
    creator = relationship("User", foreign_keys=[created_by], backref="created_surat_masuk")
    updater = relationship("User", foreign_keys=[updated_by], backref="updated_surat_masuk")
    disposisi = relationship("Disposisi", back_populates="surat_masuk", lazy="dynamic")
    
    def __repr__(self):
        return f"<SuratMasuk(id={self.id}, nomor='{self.nomor_surat}', pengirim='{self.pengirim}')>"

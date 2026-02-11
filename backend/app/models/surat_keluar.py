"""
Surat Keluar (Outgoing Mail) Model
"""
from sqlalchemy import Column, String, Text, Integer, Date, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.models.surat_masuk import StatusSurat, PrioritySurat  # Reuse enums


class SuratKeluar(BaseModel):
    """
    Outgoing mail model
    Stores information about letters sent by the organization
    """
    __tablename__ = "surat_keluar"
    
    # Letter Info - Auto-generated number
    nomor_surat_keluar = Column(String(100), nullable=False, unique=True, index=True)  # Auto-generated
    tanggal_surat = Column(Date, nullable=False, index=True)
    penerima = Column(String(255), nullable=False, index=True)  # Recipient
    tembusan = Column(Text, nullable=True)  # CC recipients (comma-separated or JSON)
    
    # Content
    perihal = Column(String(500), nullable=False)
    isi_singkat = Column(Text, nullable=True)
    
    # Categorization
    kategori_id = Column(Integer, ForeignKey("kategori.id"), nullable=True, index=True)
    
    # File Information
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    original_filename = Column(String(255), nullable=False)
    
    # OCR Results (optional for outgoing - if scanning sent letters)
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    keywords = Column(JSON, nullable=True)
    
    # Status and Priority
    status = Column(Enum(StatusSurat), default=StatusSurat.BARU, nullable=False, index=True)
    priority = Column(Enum(PrioritySurat), default=PrioritySurat.SEDANG, nullable=False, index=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    kategori = relationship("Kategori", back_populates="surat_keluar")
    creator = relationship("User", foreign_keys=[created_by], backref="created_surat_keluar")
    updater = relationship("User", foreign_keys=[updated_by], backref="updated_surat_keluar")
    disposisi = relationship("Disposisi", back_populates="surat_keluar", lazy="dynamic")
    
    def __repr__(self):
        return f"<SuratKeluar(id={self.id}, nomor='{self.nomor_surat_keluar}', penerima='{self.penerima}')>"

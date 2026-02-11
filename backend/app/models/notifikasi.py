"""
Notifikasi (Notification) Model
Stores user notifications for various events
"""
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class TipeNotifikasi(str, enum.Enum):
    """Notification type enum"""
    SURAT_MASUK = "surat_masuk"
    SURAT_KELUAR = "surat_keluar"
    DISPOSISI = "disposisi"
    DEADLINE = "deadline"
    STATUS_UPDATE = "status_update"
    SYSTEM = "system"


class Notifikasi(BaseModel):
    """
    Notification model
    Stores notifications for users about various system events
    """
    __tablename__ = "notifikasi"
    
    # Recipient
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Notification Details
    tipe = Column(Enum(TipeNotifikasi), nullable=False, index=True)
    judul = Column(String(255), nullable=False)
    pesan = Column(Text, nullable=False)
    link = Column(String(500), nullable=True)  # Link to related resource
    
    # Read Status
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    
    # References (optional, for linking to specific resources)
    surat_masuk_id = Column(Integer, ForeignKey("surat_masuk.id", ondelete="CASCADE"), nullable=True)
    surat_keluar_id = Column(Integer, ForeignKey("surat_keluar.id", ondelete="CASCADE"), nullable=True)
    disposisi_id = Column(Integer, ForeignKey("disposisi.id", ondelete="CASCADE"), nullable=True)
    
    # Relationships
    user = relationship("User", backref="notifikasi")
    surat_masuk = relationship("SuratMasuk", backref="notifikasi")
    surat_keluar = relationship("SuratKeluar", backref="notifikasi")
    disposisi = relationship("Disposisi", backref="notifikasi")
    
    def __repr__(self):
        return f"<Notifikasi(id={self.id}, user_id={self.user_id}, tipe='{self.tipe}', is_read={self.is_read})>"

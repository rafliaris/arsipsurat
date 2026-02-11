"""
Disposisi (Letter Routing/Disposition) Model
"""
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum, DateTime, Date
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class StatusDisposisi(str, enum.Enum):
    """Status enum for disposisi"""
    PENDING = "pending"
    DITINDAKLANJUTI = "ditindaklanjuti"
    SELESAI = "selesai"
    DIBATALKAN = "dibatalkan"


class Disposisi(BaseModel):
    """
    Disposition/routing model
    Tracks how letters are routed between users for action
    """
    __tablename__ = "disposisi"
    
    # Letter References (polymorphic - can be surat_masuk or surat_keluar)
    surat_masuk_id = Column(Integer, ForeignKey("surat_masuk.id"), nullable=True, index=True)
    surat_keluar_id = Column(Integer, ForeignKey("surat_keluar.id"), nullable=True, index=True)
    
    # Routing Info
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # Who sent
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)    # Who receives
    
    # Content
    catatan = Column(Text, nullable=True)  # Notes/comments
    instruksi = Column(Text, nullable=True)  # Instructions for recipient
    
    # Deadline
    batas_waktu = Column(Date, nullable=True)  # Deadline for action
    
    # Status
    status = Column(Enum(StatusDisposisi), default=StatusDisposisi.PENDING, nullable=False, index=True)
    
    # Completion
    tanggal_selesai = Column(DateTime, nullable=True)  # When marked as completed
    keterangan_selesai = Column(Text, nullable=True)  # Completion notes
    
    # Relationships
    surat_masuk = relationship("SuratMasuk", back_populates="disposisi")
    surat_keluar = relationship("SuratKeluar", back_populates="disposisi")
    from_user = relationship("User", foreign_keys=[from_user_id], backref="disposisi_sent")
    to_user = relationship("User", foreign_keys=[to_user_id], backref="disposisi_received")
    
    def __repr__(self):
        surat_type = "SM" if self.surat_masuk_id else "SK"
        surat_id = self.surat_masuk_id or self.surat_keluar_id
        return f"<Disposisi(id={self.id}, {surat_type}={surat_id}, status='{self.status}')>"

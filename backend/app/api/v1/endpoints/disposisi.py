"""
Disposisi API Endpoints
Handles letter routing and tracking
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.disposisi import Disposisi, StatusDisposisi
from app.models.surat_masuk import SuratMasuk
from app.models.surat_keluar import SuratKeluar
from app.schemas.disposisi import (
    DisposisiCreate,
    DisposisiUpdate,
    DisposisiResponse,
)
from app.api.deps import get_current_user
from datetime import datetime

router = APIRouter(prefix="/disposisi")


@router.post("", response_model=DisposisiResponse, status_code=status.HTTP_201_CREATED)
def create_disposisi(
    disposisi: DisposisiCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Create new disposition for a letter
    Can be assigned to surat_masuk or surat_keluar
    """
    # Verify the letter exists
    if disposisi.surat_masuk_id:
        surat = db.query(SuratMasuk).filter(
            SuratMasuk.id == disposisi.surat_masuk_id,
            SuratMasuk.deleted_at == None
        ).first()
        if not surat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Surat masuk not found"
            )
    elif disposisi.surat_keluar_id:
        surat = db.query(SuratKeluar).filter(
            SuratKeluar.id == disposisi.surat_keluar_id,
            SuratKeluar.deleted_at == None
        ).first()
        if not surat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Surat keluar not found"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either surat_masuk_id or surat_keluar_id must be provided"
        )
    
    # Create disposition
    db_disposisi = Disposisi(
        **disposisi.model_dump(),
        from_user_id=current_user.id
    )
    
    db.add(db_disposisi)
    db.commit()
    db.refresh(db_disposisi)
    
    # TODO: Create notification for to_user_id
    
    return db_disposisi


@router.get("", response_model=List[DisposisiResponse])
def list_disposisi(
    skip: int = 0,
    limit: int = 20,
    status: Optional[StatusDisposisi] = None,
    surat_type: Optional[str] = Query(None, regex="^(masuk|keluar)$"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    List dispositions for current user
    Shows both received and sent dispositions
    """
    query = db.query(Disposisi).filter(
        Disposisi.deleted_at == None,
        or_(
            Disposisi.from_user_id == current_user.id,
            Disposisi.to_user_id == current_user.id
        )
    )
    
    # Filter by status
    if status:
        query = query.filter(Disposisi.status == status)
    
    # Filter by surat type
    if surat_type == "masuk":
        query = query.filter(Disposisi.surat_masuk_id != None)
    elif surat_type == "keluar":
        query = query.filter(Disposisi.surat_keluar_id != None)
    
    # Order by newest first
    query = query.order_by(Disposisi.created_at.desc())
    
    dispositions = query.offset(skip).limit(limit).all()
    return dispositions


@router.get("/{disposisi_id}", response_model=DisposisiResponse)
def get_disposisi(
    disposisi_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get disposition detail"""
    disposisi = db.query(Disposisi).filter(
        Disposisi.id == disposisi_id,
        Disposisi.deleted_at == None
    ).first()
    
    if not disposisi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disposisi not found"
        )
    
    # Check permission (only sender or receiver can view)
    if disposisi.from_user_id != current_user.id and disposisi.to_user_id != current_user.id:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this disposition"
            )
    
    return disposisi


@router.put("/{disposisi_id}/complete", response_model=DisposisiResponse)
def complete_disposisi(
    disposisi_id: int,
    keterangan: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Mark disposition as complete
    Only the recipient can complete
    """
    disposisi = db.query(Disposisi).filter(
        Disposisi.id == disposisi_id,
        Disposisi.deleted_at == None
    ).first()
    
    if not disposisi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disposisi not found"
        )
    
    # Check permission (only recipient can complete)
    if disposisi.to_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recipient can complete this disposition"
        )
    
    # Check if already completed
    if disposisi.status == StatusDisposisi.SELESAI:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Disposition is already completed"
        )
    
    # Mark as complete
    disposisi.status = StatusDisposisi.SELESAI
    disposisi.tanggal_selesai = datetime.utcnow()
    disposisi.keterangan_selesai = keterangan
    
    db.commit()
    db.refresh(disposisi)
    
    # TODO: Create notification for sender
    
    return disposisi


@router.put("/{disposisi_id}", response_model=DisposisiResponse)
def update_disposisi(
    disposisi_id: int,
    disposisi_update: DisposisiUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Update disposition (change status, notes, etc)
    """
    db_disposisi = db.query(Disposisi).filter(
        Disposisi.id == disposisi_id,
        Disposisi.deleted_at == None
    ).first()
    
    if not db_disposisi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disposisi not found"
        )
    
    # Check permission
    if db_disposisi.to_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this disposition"
        )
    
    # Update fields
    update_data = disposisi_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_disposisi, field, value)
    
    db.commit()
    db.refresh(db_disposisi)
    
    return db_disposisi


@router.delete("/{disposisi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disposisi(
    disposisi_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Soft delete disposition
    Only sender or admin can delete
    """
    disposisi = db.query(Disposisi).filter(
        Disposisi.id == disposisi_id,
        Disposisi.deleted_at == None
    ).first()
    
    if not disposisi:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disposisi not found"
        )
    
    # Check permission
    if disposisi.from_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the sender or admin can delete this disposition"
        )
    
    # Soft delete
    disposisi.soft_delete()
    db.commit()
    
    return None

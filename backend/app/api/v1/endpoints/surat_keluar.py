"""
Surat Keluar API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.surat_keluar import SuratKeluar
from app.schemas.surat_keluar import (
    SuratKeluarCreate,
    SuratKeluarUpdate,
    SuratKeluarResponse,
    SuratKeluarList,
)
from app.services.file_service import file_service
from app.services.ocr_service import ocr_service
from app.api.deps import get_current_user
from datetime import date, datetime
import json

router = APIRouter(prefix="/surat-keluar")


def generate_nomor_surat_keluar(db: Session, tahun: int) -> str:
    """
    Generate auto-incrementing nomor surat keluar
    Format: 001/SK/POLDA/II/2026
    """
    # Get max number for this year
    max_surat = db.query(func.max(SuratKeluar.id)).filter(
        func.year(SuratKeluar.tanggal_surat) == tahun
    ).scalar()
    
    next_num = (max_surat or 0) + 1
    bulan_romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    bulan = bulan_romawi[datetime.now().month - 1]
    
    return f"{next_num:03d}/SK/POLDA/{bulan}/{tahun}"


@router.get("", response_model=List[SuratKeluarList])
def list_surat_keluar(
    skip: int = 0,
    limit: int = 10,
    search: str = None,
    kategori_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get list of surat keluar with filtering
    """
    query = db.query(SuratKeluar).filter(SuratKeluar.deleted_at == None)
    
    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (SuratKeluar.nomor_surat_keluar.like(search_filter)) |
            (SuratKeluar.penerima.like(search_filter)) |
            (SuratKeluar.perihal.like(search_filter))
        )
    
    if kategori_id:
        query = query.filter(SuratKeluar.kategori_id == kategori_id)
    
    if status:
        query = query.filter(SuratKeluar.status == status)
    
    # Order by newest first
    query = query.order_by(SuratKeluar.created_at.desc())
    
    surat_list = query.offset(skip).limit(limit).all()
    return surat_list


@router.post("", response_model=SuratKeluarResponse, status_code=status.HTTP_201_CREATED)
async def create_surat_keluar(
    tanggal_surat: date = Form(...),
    penerima: str = Form(...),
    perihal: str = Form(...),
    tembusan: str = Form(None),
    isi_singkat: str = Form(None),
    kategori_id: int = Form(None),
    priority: str = Form("sedang"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Create new surat keluar with auto-generated number
    """
    # Generate nomor surat keluar
    nomor_surat = generate_nomor_surat_keluar(db, tanggal_surat.year)
    
    # Save uploaded file
    file_path, mime_type, file_size = await file_service.save_upload_file(
        file, 
        file_type="surat_keluar",
        date=tanggal_surat
    )
    
    # Process OCR (optional for outgoing letters)
    ocr_result = ocr_service.process_file(file_path, mime_type)
    
    # Create surat keluar record
    db_surat = SuratKeluar(
        nomor_surat_keluar=nomor_surat,
        tanggal_surat=tanggal_surat,
        penerima=penerima,
        tembusan=tembusan,
        perihal=perihal,
        isi_singkat=isi_singkat,
        kategori_id=kategori_id,
        priority=priority,
        file_path=file_path,
        file_type=mime_type,
        file_size=file_size,
        original_filename=file.filename,
        ocr_text=ocr_result['text'],
        ocr_confidence=ocr_result['confidence'],
        keywords=json.dumps(ocr_result['keywords']) if ocr_result['keywords'] else None,
        created_by=current_user.id,
    )
    
    db.add(db_surat)
    db.commit()
    db.refresh(db_surat)
    
    return db_surat


@router.get("/{surat_id}", response_model=SuratKeluarResponse)
def get_surat_keluar(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get surat keluar detail"""
    surat = db.query(SuratKeluar).filter(
        SuratKeluar.id == surat_id,
        SuratKeluar.deleted_at == None
    ).first()
    
    if not surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    return surat


@router.put("/{surat_id}", response_model=SuratKeluarResponse)
def update_surat_keluar(
    surat_id: int,
    surat_update: SuratKeluarUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Update surat keluar"""
    db_surat = db.query(SuratKeluar).filter(
        SuratKeluar.id == surat_id,
        SuratKeluar.deleted_at == None
    ).first()
    
    if not db_surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    # Update fields
    update_data = surat_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_surat, field, value)
    
    db_surat.updated_by = current_user.id
    db.commit()
    db.refresh(db_surat)
    
    return db_surat


@router.delete("/{surat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_surat_keluar(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Soft delete surat keluar"""
    db_surat = db.query(SuratKeluar).filter(
        SuratKeluar.id == surat_id,
        SuratKeluar.deleted_at == None
    ).first()
    
    if not db_surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    # Soft delete
    db_surat.soft_delete()
    db.commit()
    
    return None


@router.get("/{surat_id}/file")
def download_file(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Download surat file"""
    surat = db.query(SuratKeluar).filter(
        SuratKeluar.id == surat_id,
        SuratKeluar.deleted_at == None
    ).first()
    
    if not surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    if not file_service.file_exists(surat.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=surat.file_path,
        filename=surat.original_filename,
        media_type=surat.file_type
    )

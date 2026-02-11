"""
Surat Masuk API Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.surat_masuk import SuratMasuk
from app.schemas.surat_masuk import (
    SuratMasukCreate,
    SuratMasukUpdate,
    SuratMasukResponse,
    SuratMasukList,
    OCRResult,
)
from app.services.file_service import file_service
from app.services.ocr_service import ocr_service
from app.api.deps import get_current_user
from datetime import date, datetime
import json

router = APIRouter(prefix="/surat-masuk")


@router.get("", response_model=List[SuratMasukList])
def list_surat_masuk(
    skip: int = 0,
    limit: int = 10,
    search: str = None,
    kategori_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get list of surat masuk with filtering
    """
    query = db.query(SuratMasuk).filter(SuratMasuk.deleted_at == None)
    
    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (SuratMasuk.nomor_surat.like(search_filter)) |
            (SuratMasuk.pengirim.like(search_filter)) |
            (SuratMasuk.perihal.like(search_filter))
        )
    
    if kategori_id:
        query = query.filter(SuratMasuk.kategori_id == kategori_id)
    
    if status:
        query = query.filter(SuratMasuk.status == status)
    
    # Order by newest first
    query = query.order_by(SuratMasuk.created_at.desc())
    
    surat_list = query.offset(skip).limit(limit).all()
    return surat_list


@router.post("", response_model=SuratMasukResponse, status_code=status.HTTP_201_CREATED)
async def create_surat_masuk(
    nomor_surat: str = Form(...),
    tanggal_surat: date = Form(...),
    tanggal_terima: date = Form(...),
    pengirim: str = Form(...),
    perihal: str = Form(...),
    isi_singkat: str = Form(None),
    kategori_id: int = Form(None),
    priority: str = Form("sedang"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Create new surat masuk with file upload and OCR processing
    """
    # Save uploaded file
    file_path, mime_type, file_size = await file_service.save_upload_file(
        file, 
        file_type="surat_masuk",
        date=tanggal_surat
    )
    
    # Process OCR
    ocr_result = ocr_service.process_file(file_path, mime_type)
    
    # Create surat masuk record
    db_surat = SuratMasuk(
        nomor_surat=nomor_surat,
        tanggal_surat=tanggal_surat,
        tanggal_terima=tanggal_terima,
        pengirim=pengirim,
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


@router.get("/{surat_id}", response_model=SuratMasukResponse)
def get_surat_masuk(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Get surat masuk detail"""
    surat = db.query(SuratMasuk).filter(
        SuratMasuk.id == surat_id,
        SuratMasuk.deleted_at == None
    ).first()
    
    if not surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    return surat


@router.put("/{surat_id}", response_model=SuratMasukResponse)
def update_surat_masuk(
    surat_id: int,
    surat_update: SuratMasukUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Update surat masuk"""
    db_surat = db.query(SuratMasuk).filter(
        SuratMasuk.id == surat_id,
        SuratMasuk.deleted_at == None
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
def delete_surat_masuk(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Soft delete surat masuk"""
    db_surat = db.query(SuratMasuk).filter(
        SuratMasuk.id == surat_id,
        SuratMasuk.deleted_at == None
    ).first()
    
    if not db_surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    # Soft delete
    db_surat.soft_delete()
    db.commit()
    
    # Optionally delete file
    # file_service.delete_file(db_surat.file_path)
    
    return None


@router.get("/{surat_id}/file")
def download_file(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Download surat file"""
    surat = db.query(SuratMasuk).filter(
        SuratMasuk.id == surat_id,
        SuratMasuk.deleted_at == None
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


@router.post("/{surat_id}/process-ocr", response_model=OCRResult)
def reprocess_ocr(
    surat_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """Re-run OCR on existing surat"""
    surat = db.query(SuratMasuk).filter(
        SuratMasuk.id == surat_id,
        SuratMasuk.deleted_at == None
    ).first()
    
    if not surat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Surat not found"
        )
    
    # Process OCR
    ocr_result = ocr_service.process_file(surat.file_path, surat.file_type)
    
    # Update surat with new OCR results
    surat.ocr_text = ocr_result['text']
    surat.ocr_confidence = ocr_result['confidence']
    surat.keywords = json.dumps(ocr_result['keywords']) if ocr_result['keywords'] else None
    surat.updated_by = current_user.id
    
    db.commit()
    
    return {
        'text': ocr_result['text'],
        'confidence': ocr_result['confidence'],
        'keywords': ocr_result['keywords'],
        'suggested_kategori_id': None  # TODO: Implement classification
    }

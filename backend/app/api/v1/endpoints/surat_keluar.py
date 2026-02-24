"""
Surat Keluar API Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pathlib import Path
import os, re
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
from app.services.extraction_service import extraction_service
from app.services.ai_extraction_service import ai_extraction_service
from app.api.deps import get_current_user
from datetime import date, datetime

router = APIRouter(prefix="/surat-keluar")


def generate_nomor_surat_keluar(db: Session, tahun: int) -> str:
    """
    Generate auto-incrementing nomor surat keluar
    Format: 001/SK/POLDA/II/2026
    """
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
    """Get list of surat keluar with filtering"""
    query = db.query(SuratKeluar).filter(SuratKeluar.deleted_at == None)
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
    query = query.order_by(SuratKeluar.created_at.desc())
    return query.offset(skip).limit(limit).all()


# ─────────────────────────────────────────────────────────────
# DETECT: Upload file, run OCR, extract fields — return for review
# ─────────────────────────────────────────────────────────────

@router.post("/detect")
async def detect_surat_keluar_fields(
    file: UploadFile = File(...),
    method: str = Form("regex"),
    current_user = Depends(get_current_user),
):
    """
    Step 1 of the auto-detect flow for surat keluar.
    Upload a document, run OCR, and return detected fields for review.
    Nomor surat is NOT extracted here — it is auto-generated on confirm.
    """
    file_path, mime_type, file_size = await file_service.save_upload_file(
        file,
        file_type="surat_keluar",
        date=datetime.now().date(),
    )

    ocr_result = ocr_service.process_file(file_path, mime_type)
    ocr_text = ocr_result.get("text", "")

    # ── Route by detection method ──────────────────────────────
    if method == "manual" or method == "ocr_only":
        empty = lambda: {"value": None, "detected": False}  # noqa: E731
        detected = {
            "penerima":      empty(),
            "perihal":       empty(),
            "tanggal_surat": empty(),
            "isi_singkat":   empty(),
        }
    elif method == "ai" and ai_extraction_service.available:
        ai_result = ai_extraction_service.extract_from_file(file_path, ocr_text)
        detected = {
            "penerima":      ai_result.get("penerima",      {"value": None, "detected": False}),
            "perihal":       ai_result.get("perihal",       {"value": None, "detected": False}),
            "tanggal_surat": ai_result.get("tanggal_surat", {"value": None, "detected": False}),
            "isi_singkat":   ai_result.get("isi_singkat",   {"value": None, "detected": False}),
        }
    elif method == "hybrid":
        if ai_extraction_service.available:
            ai_result    = ai_extraction_service.extract_from_file(file_path, ocr_text)
            regex_result = extraction_service.extract_all(ocr_text)
            def _merge(key: str, regex_key: str | None = None):
                rkey = regex_key or key
                ai_f = ai_result.get(key,  {"value": None, "detected": False})
                rg_f = regex_result.get(rkey, {"value": None, "detected": False})
                return ai_f if ai_f["detected"] else rg_f
            detected = {
                "penerima":      _merge("penerima"),
                "perihal":       _merge("perihal"),
                "tanggal_surat": _merge("tanggal_surat"),
                "isi_singkat":   _merge("isi_singkat"),
            }
        else:
            extracted = extraction_service.extract_all(ocr_text)
            penerima = extracted.get("penerima", {"value": None, "detected": False})
            if not penerima["detected"] and ocr_text:
                m = re.search(r"(?:Kepada\s+Yth\.?|Kepada|Yth\.)\s*[:\.]?\s*(.+?)(?:\n|$)", ocr_text, re.IGNORECASE)
                if m:
                    penerima = {"value": m.group(1).strip(), "detected": True}
            detected = {
                "penerima":      penerima,
                "perihal":       extracted["perihal"],
                "tanggal_surat": extracted["tanggal_surat"],
                "isi_singkat":   extracted.get("isi_singkat", {"value": None, "detected": False}),
            }
    else:
        extracted = extraction_service.extract_all(ocr_text)
        penerima = extracted.get("penerima", {"value": None, "detected": False})
        if not penerima["detected"] and ocr_text:
            m = re.search(r"(?:Kepada\s+Yth\.?|Kepada|Yth\.)\s*[:\.]?\s*(.+?)(?:\n|$)", ocr_text, re.IGNORECASE)
            if m:
                penerima = {"value": m.group(1).strip(), "detected": True}
        detected = {
            "penerima":      penerima,
            "perihal":       extracted["perihal"],
            "tanggal_surat": extracted["tanggal_surat"],
            "isi_singkat":   extracted.get("isi_singkat", {"value": None, "detected": False}),
        }

    return {
        "file_token": file_path,
        "file_size": file_size,
        "original_filename": file.filename,
        "mime_type": mime_type,
        "ocr_text": ocr_text,
        "ocr_confidence": ocr_result.get("confidence"),
        "keywords": ocr_result.get("keywords", []),
        "detected": detected,
    }


# ─────────────────────────────────────────────────────────────
# CREATE (CONFIRM): Save reviewed fields + already-uploaded file
# ─────────────────────────────────────────────────────────────

@router.post("", response_model=SuratKeluarResponse, status_code=status.HTTP_201_CREATED)
async def create_surat_keluar(
    # File token from detect step
    file_token: Optional[str] = Form(None),
    # Reviewed / confirmed fields
    tanggal_surat: date = Form(...),
    penerima: str = Form(...),
    perihal: str = Form(...),
    tembusan: Optional[str] = Form(None),
    isi_singkat: Optional[str] = Form(None),
    kategori_id: Optional[int] = Form(None),
    priority: str = Form("sedang"),
    # Fallback: allow re-upload if no token provided
    file: Optional[UploadFile] = File(None),
    # OCR data forwarded from detect step
    ocr_text: Optional[str] = Form(None),
    ocr_confidence: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Step 2 — Confirm and save surat keluar.
    Accepts file_token from /detect step (no re-upload needed).
    Nomor surat is auto-generated server-side.
    """
    # Resolve file
    if file_token:
        if not file_service.file_exists(file_token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file_token — file not found. Please re-upload.",
            )
        final_file_path = file_token
        ext = Path(file_token).suffix.lower()
        mime_map = {".pdf": "application/pdf", ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg", ".png": "image/png"}
        final_mime_type = mime_map.get(ext, "application/octet-stream")
        final_file_size = os.path.getsize(file_token) if os.path.exists(file_token) else 0
        original_filename = Path(file_token).name
    elif file:
        final_file_path, final_mime_type, final_file_size = await file_service.save_upload_file(
            file, file_type="surat_keluar", date=tanggal_surat
        )
        original_filename = file.filename
        if not ocr_text:
            ocr_result = ocr_service.process_file(final_file_path, final_mime_type)
            ocr_text = ocr_result.get("text", "") or None
            ocr_confidence = ocr_result.get("confidence") or None
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file_token or a file upload is required.",
        )

    # Auto-generate nomor surat keluar
    nomor_surat = generate_nomor_surat_keluar(db, tanggal_surat.year)

    # Extract keywords
    keywords = None
    if ocr_text:
        keywords = ocr_service.extract_keywords(ocr_text) or None

    db_surat = SuratKeluar(
        nomor_surat_keluar=nomor_surat,
        tanggal_surat=tanggal_surat,
        penerima=penerima,
        tembusan=tembusan,
        perihal=perihal,
        isi_singkat=isi_singkat,
        kategori_id=kategori_id,
        priority=priority,
        file_path=final_file_path,
        file_type=final_mime_type,
        file_size=final_file_size,
        original_filename=original_filename,
        ocr_text=ocr_text or None,
        ocr_confidence=ocr_confidence if ocr_confidence else None,
        keywords=keywords,
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

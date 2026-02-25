"""
Surat Masuk API Endpoints
"""
from typing import List, Optional
import os
from pathlib import Path
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.surat_masuk import SuratMasuk
from app.schemas.surat_masuk import SuratMasukCreate, SuratMasukResponse, SuratMasukUpdate, SuratMasukList, OCRResult
from app.services.file_service import file_service
from app.services.ocr_service import ocr_service
from app.services.extraction_service import extraction_service
from app.services.ai_extraction_service import ai_extraction_service
from app.api.deps import get_current_user


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


# ─────────────────────────────────────────────────────────────
# DETECT: Upload file, run OCR, extract fields — return for review
# ─────────────────────────────────────────────────────────────

@router.post("/detect")
async def detect_surat_fields(
    file: UploadFile = File(...),
    method: str = Form("regex"),
    current_user = Depends(get_current_user),
):
    """
    Step 1 of the auto-detect flow.
    Upload a document (PDF/image), run OCR, and return detected fields
    for the user to review before saving.

    Returns:
        file_token: temporary file path to use in the confirm step
        detected fields: nomor_surat, perihal, tanggal_surat, pengirim
        ocr_text: full extracted text
    """
    # Save the file into temp storage
    file_path, mime_type, file_size = await file_service.save_upload_file(
        file,
        file_type="surat_masuk",
        date=datetime.now().date(),
    )

    # Run OCR — non-fatal
    ocr_result = ocr_service.process_file(file_path, mime_type)
    ocr_text = ocr_result.get("text", "")

    # ── Route by detection method ──────────────────────────────
    ai_error = None  # populated if AI returns an error

    if method == "manual" or method == "ocr_only":
        # No field extraction — return empty detected fields
        empty = lambda: {"value": None, "detected": False}  # noqa: E731
        detected = {
            "nomor_surat":   empty(),
            "perihal":       empty(),
            "tanggal_surat": empty(),
            "pengirim":      empty(),
            "penerima":      empty(),
            "isi_singkat":   empty(),
        }
    elif method == "ai":
        if not ai_extraction_service.available:
            ai_error = {"code": 0, "message": "OPENROUTER_API_KEY tidak dikonfigurasi di server"}
            detected = {f: {"value": None, "detected": False} for f in
                        ["nomor_surat", "perihal", "tanggal_surat", "pengirim", "penerima", "isi_singkat"]}
        else:
            detected = ai_extraction_service.extract_from_file(file_path, ocr_text)
            ai_error = detected.pop("_error", None)  # pull error out of detected dict
    elif method == "hybrid":
        if ai_extraction_service.available:
            # AI from file + fill gaps with regex
            ai_result    = ai_extraction_service.extract_from_file(file_path, ocr_text)
            ai_error     = ai_result.pop("_error", None)
            regex_result = extraction_service.extract_all(ocr_text)
            detected = {}
            for key in ["nomor_surat", "perihal", "tanggal_surat", "pengirim", "penerima", "isi_singkat"]:
                ai_field = ai_result.get(key, {"value": None, "detected": False})
                detected[key] = ai_field if ai_field["detected"] else regex_result.get(key, {"value": None, "detected": False})
        else:
            detected = extraction_service.extract_all(ocr_text)
    else:
        # Default: regex
        detected = extraction_service.extract_all(ocr_text)

    response = {
        "file_token": file_path,
        "file_size": file_size,
        "original_filename": file.filename,
        "mime_type": mime_type,
        "ocr_text": ocr_text,
        "ocr_confidence": ocr_result.get("confidence"),
        "keywords": ocr_result.get("keywords", []),
        "detected": detected,
    }
    if ai_error:
        response["ai_error"] = ai_error
    return response


# ─────────────────────────────────────────────────────────────
# CREATE (CONFIRM): Save reviewed fields + already-uploaded file
# ─────────────────────────────────────────────────────────────

@router.post("", response_model=SuratMasukResponse, status_code=status.HTTP_201_CREATED)
async def create_surat_masuk(
    # File token from detect step (already uploaded file path)
    file_token: Optional[str] = Form(None),
    # Reviewed / confirmed fields
    nomor_surat: Optional[str] = Form(None),
    tanggal_surat: date = Form(...),
    tanggal_terima: date = Form(...),
    pengirim: str = Form(...),
    perihal: str = Form(...),
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
    Step 2 — Confirm and save the surat masuk.
    Accepts file_token from the /detect step (no re-upload needed).
    Falls back to a fresh file upload if file_token is not provided.
    """
    # Resolve file — prefer the already-uploaded file_token
    if file_token:
        if not file_service.file_exists(file_token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file_token — file not found. Please re-upload.",
            )
        final_file_path = file_token
        # Determine mime type from extension
        from pathlib import Path
        ext = Path(file_token).suffix.lower()
        mime_map = {".pdf": "application/pdf", ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg", ".png": "image/png"}
        final_mime_type = mime_map.get(ext, "application/octet-stream")
        import os
        final_file_size = os.path.getsize(file_token) if os.path.exists(file_token) else 0
        original_filename = Path(file_token).name
    elif file:
        final_file_path, final_mime_type, final_file_size = await file_service.save_upload_file(
            file, file_type="surat_masuk", date=tanggal_surat
        )
        original_filename = file.filename
        # Run OCR on fresh upload if not forwarded
        if not ocr_text:
            ocr_result = ocr_service.process_file(final_file_path, final_mime_type)
            ocr_text = ocr_result.get("text", "") or None
            ocr_confidence = ocr_result.get("confidence") or None
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file_token or a file upload is required.",
        )

    # Auto-generate nomor surat if user left it blank
    if not nomor_surat:
        nomor_surat = f"SM/{datetime.now().strftime('%Y%m%d%H%M%S')}"

    # Extract keywords from OCR text if not already available
    keywords = None
    if ocr_text:
        keywords = ocr_service.extract_keywords(ocr_text) or None

    db_surat = SuratMasuk(
        nomor_surat=nomor_surat,
        tanggal_surat=tanggal_surat,
        tanggal_terima=tanggal_terima,
        pengirim=pengirim,
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

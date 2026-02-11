"""
Reports API Endpoints
Handles data export to Excel and PDF
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.surat_masuk import SuratMasuk
from app.models.surat_keluar import SuratKeluar
from app.services.export_service import ExportService
from app.api.deps import get_current_user

router = APIRouter(prefix="/reports")


@router.get("/surat-masuk/excel")
def export_surat_masuk_excel(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    kategori_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Export Surat Masuk to Excel
    Filter by date range and category
    """
    query = db.query(SuratMasuk).filter(SuratMasuk.deleted_at == None)
    
    # Date filters
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(SuratMasuk.tanggal_surat >= start)
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(SuratMasuk.tanggal_surat <= end)
    
    # Category filter
    if kategori_id:
        query = query.filter(SuratMasuk.kategori_id == kategori_id)
    
    # Order by date
    surat_list = query.order_by(SuratMasuk.tanggal_surat.desc()).all()
    
    # Generate Excel
    buffer = ExportService.export_surat_masuk_to_excel(surat_list)
    
    # Generate filename
    filename = f"surat_masuk_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/surat-keluar/excel")
def export_surat_keluar_excel(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    kategori_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Export Surat Keluar to Excel
    Filter by date range and category
    """
    query = db.query(SuratKeluar).filter(SuratKeluar.deleted_at == None)
    
    # Date filters
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(SuratKeluar.tanggal_surat >= start)
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(SuratKeluar.tanggal_surat <= end)
    
    # Category filter
    if kategori_id:
        query = query.filter(SuratKeluar.kategori_id == kategori_id)
    
    # Order by date
    surat_list = query.order_by(SuratKeluar.tanggal_surat.desc()).all()
    
    # Generate Excel
    buffer = ExportService.export_surat_keluar_to_excel(surat_list)
    
    # Generate filename
    filename = f"surat_keluar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/surat-masuk/pdf")
def export_surat_masuk_pdf(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    kategori_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Export Surat Masuk to PDF
    Filter by date range and category
    """
    query = db.query(SuratMasuk).filter(SuratMasuk.deleted_at == None)
    
    # Date filters
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(SuratMasuk.tanggal_surat >= start)
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(SuratMasuk.tanggal_surat <= end)
    
    # Category filter
    if kategori_id:
        query = query.filter(SuratMasuk.kategori_id == kategori_id)
    
    # Order by date
    surat_list = query.order_by(SuratMasuk.tanggal_surat.desc()).all()
    
    # Generate title
    title = "Laporan Surat Masuk"
    if start_date or end_date:
        title += f" ({start_date or 'awal'} s/d {end_date or 'akhir'})"
    
    # Generate PDF
    buffer = ExportService.export_surat_masuk_to_pdf(surat_list, title)
    
    # Generate filename
    filename = f"surat_masuk_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/surat-keluar/pdf")
def export_surat_keluar_pdf(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    kategori_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Export Surat Keluar to PDF
    Filter by date range and category
    """
    query = db.query(SuratKeluar).filter(SuratKeluar.deleted_at == None)
    
    # Date filters
    if start_date:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(SuratKeluar.tanggal_surat >= start)
    
    if end_date:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        query = query.filter(SuratKeluar.tanggal_surat <= end)
    
    # Category filter
    if kategori_id:
        query = query.filter(SuratKeluar.kategori_id == kategori_id)
    
    # Order by date
    surat_list = query.order_by(SuratKeluar.tanggal_surat.desc()).all()
    
    # Generate title
    title = "Laporan Surat Keluar"
    if start_date or end_date:
        title += f" ({start_date or 'awal'} s/d {end_date or 'akhir'})"
    
    # Generate PDF
    buffer = ExportService.export_surat_keluar_to_pdf(surat_list, title)
    
    # Generate filename
    filename = f"surat_keluar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

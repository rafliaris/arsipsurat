"""
Dashboard API Endpoints
Provides statistics and analytics for the dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import Dict, List
from pydantic import BaseModel

from app.database import get_db
from app.models.surat_masuk import SuratMasuk, StatusSurat
from app.models.surat_keluar import SuratKeluar
from app.models.disposisi import Disposisi, StatusDisposisi
from app.models.kategori import Kategori
from app.models.notifikasi import Notifikasi
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard")


class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_surat_masuk: int
    total_surat_keluar: int
    surat_masuk_bulan_ini: int
    surat_keluar_bulan_ini: int
    disposisi_pending: int
    disposisi_selesai: int
    notifikasi_unread: int
    total_kategori: int


class ChartDataPoint(BaseModel):
    """Single data point for charts"""
    label: str
    value: int
    color: str | None = None


class RecentActivity(BaseModel):
    """Recent activity item"""
    id: int
    type: str  # 'surat_masuk', 'surat_keluar', 'disposisi'
    title: str
    description: str
    created_at: datetime
    link: str | None = None


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get dashboard statistics
    Shows overall metrics
    """
    # Current month date range
    now = datetime.utcnow()
    first_day_of_month = datetime(now.year, now.month, 1)
    
    # Total surat masuk
    total_surat_masuk = db.query(func.count(SuratMasuk.id)).filter(
        SuratMasuk.deleted_at == None
    ).scalar() or 0
    
    # Total surat keluar
    total_surat_keluar = db.query(func.count(SuratKeluar.id)).filter(
        SuratKeluar.deleted_at == None
    ).scalar() or 0
    
    # Surat masuk this month
    surat_masuk_bulan_ini = db.query(func.count(SuratMasuk.id)).filter(
        SuratMasuk.deleted_at == None,
        SuratMasuk.created_at >= first_day_of_month
    ).scalar() or 0
    
    # Surat keluar this month
    surat_keluar_bulan_ini = db.query(func.count(SuratKeluar.id)).filter(
        SuratKeluar.deleted_at == None,
        SuratKeluar.created_at >= first_day_of_month
    ).scalar() or 0
    
    # Disposisi pending (for current user or from current user)
    disposisi_pending = db.query(func.count(Disposisi.id)).filter(
        Disposisi.deleted_at == None,
        Disposisi.status.in_([StatusDisposisi.PENDING, StatusDisposisi.PROSES]),
        (Disposisi.to_user_id == current_user.id) | (Disposisi.from_user_id == current_user.id)
    ).scalar() or 0
    
    # Disposisi completed
    disposisi_selesai = db.query(func.count(Disposisi.id)).filter(
        Disposisi.deleted_at == None,
        Disposisi.status == StatusDisposisi.SELESAI,
        (Disposisi.to_user_id == current_user.id) | (Disposisi.from_user_id == current_user.id)
    ).scalar() or 0
    
    # Unread notifications
    notifikasi_unread = db.query(func.count(Notifikasi.id)).filter(
        Notifikasi.user_id == current_user.id,
        Notifikasi.is_read == False,
        Notifikasi.deleted_at == None
    ).scalar() or 0
    
    # Total categories
    total_kategori = db.query(func.count(Kategori.id)).filter(
        Kategori.is_active == True,
        Kategori.deleted_at == None
    ).scalar() or 0
    
    return DashboardStats(
        total_surat_masuk=total_surat_masuk,
        total_surat_keluar=total_surat_keluar,
        surat_masuk_bulan_ini=surat_masuk_bulan_ini,
        surat_keluar_bulan_ini=surat_keluar_bulan_ini,
        disposisi_pending=disposisi_pending,
        disposisi_selesai=disposisi_selesai,
        notifikasi_unread=notifikasi_unread,
        total_kategori=total_kategori,
    )


@router.get("/charts/by-kategori", response_model=List[ChartDataPoint])
def get_surat_by_kategori(
    jenis: str = "masuk",  # 'masuk' or 'keluar'
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get surat count by category for pie/bar chart
    """
    if jenis == "masuk":
        model = SuratMasuk
    else:
        model = SuratKeluar
    
    # Query with join to get category name and color
    query = db.query(
        Kategori.nama,
        Kategori.color,
        func.count(model.id).label("count")
    ).join(
        model, model.kategori_id == Kategori.id
    ).filter(
        model.deleted_at == None,
        Kategori.deleted_at == None
    ).group_by(Kategori.id, Kategori.nama, Kategori.color)
    
    results = query.all()
    
    return [
        ChartDataPoint(
            label=nama,
            value=count,
            color=color
        )
        for nama, color, count in results
    ]


@router.get("/charts/by-month", response_model=List[ChartDataPoint])
def get_surat_by_month(
    months: int = 6,  # Last N months
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get surat count by month for line chart
    Shows both masuk and keluar
    """
    now = datetime.utcnow()
    start_date = now - timedelta(days=months * 30)
    
    # Surat masuk by month
    masuk_query = db.query(
        extract('year', SuratMasuk.created_at).label('year'),
        extract('month', SuratMasuk.created_at).label('month'),
        func.count(SuratMasuk.id).label('count')
    ).filter(
        SuratMasuk.deleted_at == None,
        SuratMasuk.created_at >= start_date
    ).group_by('year', 'month').all()
    
    # Surat keluar by month
    keluar_query = db.query(
        extract('year', SuratKeluar.created_at).label('year'),
        extract('month', SuratKeluar.created_at).label('month'),
        func.count(SuratKeluar.id).label('count')
    ).filter(
        SuratKeluar.deleted_at == None,
        SuratKeluar.created_at >= start_date
    ).group_by('year', 'month').all()
    
    # Format results
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                   'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    
    result = []
    
    # Combine results
    month_data = {}
    for year, month, count in masuk_query:
        key = f"{month_names[int(month)-1]} {int(year)}"
        month_data[key] = count
    
    for key, count in month_data.items():
        result.append(ChartDataPoint(
            label=key,
            value=count,
            color="#3B82F6"  # Blue for chart
        ))
    
    return result


@router.get("/recent", response_model=List[RecentActivity])
def get_recent_activity(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    """
    Get recent activity (surat masuk, keluar, disposisi)
    Combined and sorted by date
    """
    activities = []
    
    # Recent surat masuk
    recent_masuk = db.query(SuratMasuk).filter(
        SuratMasuk.deleted_at == None
    ).order_by(SuratMasuk.created_at.desc()).limit(limit).all()
    
    for surat in recent_masuk:
        activities.append({
            'id': surat.id,
            'type': 'surat_masuk',
            'title': f"Surat Masuk: {surat.nomor_surat}",
            'description': surat.perihal,
            'created_at': surat.created_at,
            'link': f"/surat-masuk/{surat.id}"
        })
    
    # Recent surat keluar
    recent_keluar = db.query(SuratKeluar).filter(
        SuratKeluar.deleted_at == None
    ).order_by(SuratKeluar.created_at.desc()).limit(limit).all()
    
    for surat in recent_keluar:
        activities.append({
            'id': surat.id,
            'type': 'surat_keluar',
            'title': f"Surat Keluar: {surat.nomor_surat_keluar}",
            'description': surat.perihal,
            'created_at': surat.created_at,
            'link': f"/surat-keluar/{surat.id}"
        })
    
    # Recent disposisi (user-specific)
    recent_disposisi = db.query(Disposisi).filter(
        Disposisi.deleted_at == None,
        (Disposisi.to_user_id == current_user.id) | (Disposisi.from_user_id == current_user.id)
    ).order_by(Disposisi.created_at.desc()).limit(limit).all()
    
    for disp in recent_disposisi:
        activities.append({
            'id': disp.id,
            'type': 'disposisi',
            'title': f"Disposisi: {disp.instruksi[:50] if disp.instruksi else 'N/A'}",
            'description': disp.keterangan or '',
            'created_at': disp.created_at,
            'link': f"/disposisi/{disp.id}"
        })
    
    # Sort by created_at desc and limit
    activities.sort(key=lambda x: x['created_at'], reverse=True)
    activities = activities[:limit]
    
    return [RecentActivity(**activity) for activity in activities]

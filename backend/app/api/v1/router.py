"""
API Router - aggregates all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, kategori, surat_masuk, surat_keluar, disposisi, notifications, dashboard, audit, settings, reports

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(kategori.router, tags=["Kategori"])
api_router.include_router(surat_masuk.router, tags=["Surat Masuk"])
api_router.include_router(surat_keluar.router, tags=["Surat Keluar"])
api_router.include_router(disposisi.router, tags=["Disposisi"])
api_router.include_router(notifications.router, tags=["Notifications"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(audit.router, tags=["Audit Logs"])
api_router.include_router(settings.router, tags=["Settings"])
api_router.include_router(reports.router, tags=["Reports"])

# TODO: Add more routers as they are created
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(surat_masuk.router, prefix="/surat-masuk", tags=["Surat Masuk"])
# api_router.include_router(surat_keluar.router, prefix="/surat-keluar", tags=["Surat Keluar"])
# api_router.include_router(disposisi.router, prefix="/disposisi", tags=["Disposisi"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
# api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

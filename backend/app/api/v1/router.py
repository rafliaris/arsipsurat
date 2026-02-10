"""
API Router - aggregates all endpoint routers
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# TODO: Add more routers as they are created
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
# api_router.include_router(surat_masuk.router, prefix="/surat-masuk", tags=["Surat Masuk"])
# api_router.include_router(surat_keluar.router, prefix="/surat-keluar", tags=["Surat Keluar"])
# api_router.include_router(disposisi.router, prefix="/disposisi", tags=["Disposisi"])
# api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
# api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

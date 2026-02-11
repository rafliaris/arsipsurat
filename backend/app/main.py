```python
"""
FastAPI Backend - Sistem Klasifikasi Arsip Surat
Entry point for the application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.router import api_router
from app.database import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler - runs on startup and shutdown
    """
    # Startup: Create default admin if no users exist
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("=" * 60)
            print("🔐 No users found in database. Creating default super admin...")
            
            default_admin = User(
                username="admin",
                email="admin@arsipsurat.local",
                full_name="Super Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            
            db.add(default_admin)
            db.commit()
            db.refresh(default_admin)
            
            print("✅ Default super admin created successfully!")
            print("   Username: admin")
            print("   Password: admin123")
            print("   ⚠️  PLEASE CHANGE THIS PASSWORD AFTER FIRST LOGIN!")
            print("=" * 60)
        else:
            print(f"✅ Database initialized. {user_count} user(s) found.")
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        db.rollback()
    finally:
        db.close()
    
    yield
    
    # Shutdown
    print("🛑 Application shutting down...")


# Create FastAPI app with lifespan
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API untuk Sistem Klasifikasi Arsip Surat Masuk dan Keluar",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for file downloads
app.mount("/files", StaticFiles(directory="storage"), name="files")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sistem Klasifikasi Arsip Surat API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

# Backend Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration settings
│   ├── database.py             # Database connection
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (auth, db session)
│   │   └── v1/                 # API version 1
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── __init__.py
│   │       │   ├── auth.py     # Login, logout, refresh token
│   │       │   ├── users.py    # User management
│   │       │   ├── surat_masuk.py
│   │       │   ├── surat_keluar.py
│   │       │   ├── kategori.py
│   │       │   ├── disposisi.py
│   │       │   ├── notifikasi.py
│   │       │   ├── reports.py  # Export endpoints
│   │       │   └── dashboard.py
│   │       └── router.py       # API router aggregator
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── surat_masuk.py
│   │   ├── surat_keluar.py
│   │   ├── kategori.py
│   │   ├── disposisi.py
│   │   ├── notifikasi.py
│   │   ├── audit_log.py
│   │   └── settings.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── surat_masuk.py
│   │   ├── surat_keluar.py
│   │   ├── kategori.py
│   │   ├── disposisi.py
│   │   ├── notifikasi.py
│   │   ├── token.py
│   │   └── common.py           # Common response schemas
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── ocr_service.py      # OCR processing
│   │   ├── classification_service.py  # Keyword matching
│   │   ├── export_service.py   # Excel, PDF, Google Sheets
│   │   ├── notification_service.py
│   │   └── file_service.py     # File upload/storage
│   │
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── security.py         # JWT, password hashing
│   │   ├── config.py           # Settings from env
│   │   └── middleware.py       # Custom middleware
│   │
│   ├── utils/                  # Utility functions
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── validators.py
│   │   ├── helpers.py
│   │   └── constants.py
│   │
│   └── tasks/                  # Celery tasks
│       ├── __init__.py
│       ├── celery_app.py
│       ├── ocr_tasks.py
│       └── notification_tasks.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
│
├── tests/                      # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   ├── test_services/
│   └── test_models/
│
├── uploads/                    # Temporary uploads (gitignored)
├── storage/                    # Permanent file storage (gitignored)
│   ├── surat_masuk/
│   └── surat_keluar/
│
├── .env.example                # Environment variables template
├── .gitignore
├── requirements.txt            # Python dependencies
├── requirements-dev.txt        # Dev dependencies
├── docker-compose.yml          # Docker setup
├── Dockerfile
└── README.md
```

## Key Principles

### 1. **Separation of Concerns**
- **Models**: Database structure (SQLAlchemy ORM)
- **Schemas**: Data validation and serialization (Pydantic)
- **Services**: Business logic
- **API**: HTTP endpoints (thin layer)

### 2. **Dependency Injection**
- Use FastAPI's dependency injection for database sessions, auth, etc.
- Defined in `app/api/deps.py`

### 3. **Async/Await**
- Use async for I/O operations (database, file processing)
- Celery for long-running tasks (OCR processing)

### 4. **Type Hints**
- Full type annotations for better IDE support and validation

### 5. **Configuration Management**
- All configs in `.env` file
- Loaded via Pydantic Settings

## Folder Responsibilities

### `/app/models/`
SQLAlchemy ORM models representing database tables.

**Example: `user.py`**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    role = Column(String(20))  # admin, staff, viewer
```

### `/app/schemas/`
Pydantic models for request/response validation.

**Example: `user.py`**
```python
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: str
    
    class Config:
        from_attributes = True
```

### `/app/services/`
Business logic separated from API endpoints.

**Example: `ocr_service.py`**
```python
import pytesseract
from PIL import Image

class OCRService:
    def extract_text_from_image(self, image_path: str) -> str:
        # OCR logic here
        pass
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        # PDF processing logic
        pass
```

### `/app/api/v1/endpoints/`
API route handlers (thin layer, delegates to services).

**Example: `surat_masuk.py`**
```python
from fastapi import APIRouter, Depends, UploadFile
from app.schemas.surat_masuk import SuratMasukCreate, SuratMasukResponse
from app.services.ocr_service import OCRService
from app.api.deps import get_current_user, get_db

router = APIRouter()

@router.post("/", response_model=SuratMasukResponse)
async def create_surat_masuk(
    file: UploadFile,
    data: SuratMasukCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Delegate to service
    pass
```

## Best Practices

1. **Use async/await** for database operations
2. **Dependency injection** for reusable components
3. **Service layer** keeps endpoints clean
4. **Pydantic schemas** for validation
5. **Type hints everywhere**
6. **Environment variables** for config
7. **Logging** for debugging
8. **Error handling** with custom exceptions

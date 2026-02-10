# Backend - Sistem Klasifikasi Arsip Surat

FastAPI backend untuk sistem klasifikasi arsip surat masuk dan surat keluar dengan fitur OCR otomatis.

## Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **OCR**: Tesseract OCR
- **Task Queue**: Celery + Redis
- **Export**: Excel, PDF, Google Sheets

## Quick Start

### 1. Setup Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install Tesseract OCR

**Windows:**
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Install and add to PATH
- Download Indonesian language data: https://github.com/tesseract-ocr/tessdata

**Linux:**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-ind
```

### 4. Setup Database

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE arsip_surat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 5. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Update DATABASE_URL, SECRET_KEY, etc.
```

### 6. Run Migrations

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 7. Run Development Server

```bash
# Start FastAPI server with auto-reload
uvicorn app.main:app --reload

# Or run directly
python -m app.main
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

See [BACKEND_STRUCTURE.md](../BACKEND_STRUCTURE.md) for detailed structure documentation.

```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── core/             # Core functionality (config, security)
│   ├── utils/            # Utilities
│   └── main.py           # Application entry point
├── alembic/              # Database migrations
├── tests/                # Tests
├── requirements.txt      # Python dependencies
└── .env.example          # Environment template
```

## API Documentation

See [FRONTEND_API_DOCS.md](../FRONTEND_API_DOCS.md) for complete API documentation for frontend team.

### Key Endpoints

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/surat-masuk/` - List incoming mail
- `POST /api/v1/surat-masuk/` - Create with OCR
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `POST /api/v1/reports/export/excel` - Export reports

## Development

### Create New Endpoint

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create endpoint in `app/api/v1/endpoints/`
4. Add router to `app/api/v1/router.py`

### Run Tests

```bash
pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - MySQL connection string
- `SECRET_KEY` - JWT secret key
- `TESSERACT_CMD` - Path to Tesseract executable
- `REDIS_URL` - Redis connection for Celery

## Deployment

### Using Docker (Recommended)

```bash
docker-compose up -d
```

### Manual Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables
3. Run migrations: `alembic upgrade head`
4. Start with Gunicorn:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Features

- ✅ JWT Authentication
- ✅ User Management
- ✅ File Upload (PDF, Word, Images)
- ⏳ OCR Text Extraction (Tesseract)
- ⏳ Auto Classification (Keyword Matching)
- ⏳ Surat Masuk/Keluar Management
- ⏳ Disposisi System
- ⏳ Dashboard Analytics
- ⏳ Export (Excel, PDF, Google Sheets)
- ⏳ Real-time Notifications
- ⏳ Audit Logging

## Contributing

For questions or issues:
1. Check API documentation at `/docs`
2. Review PLAN.md for system design
3. Contact team lead

## License

Internal Project - POLDA

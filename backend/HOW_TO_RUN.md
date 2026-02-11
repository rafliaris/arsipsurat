# Arsip Surat Backend - How to Run

## Prerequisites

1. **Python 3.10+** installed
2. **MySQL 8.0+** installed and running
3. **Tesseract OCR** installed (for document processing)

---

## First-Time Setup

### 1. Clone Repository

```powershell
git clone <repository-url>
cd arsipsurat/backend
```

### 2. Create Virtual Environment

```powershell
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and update:

```powershell
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/arsipsurat
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 5. Create Database

```sql
CREATE DATABASE arsipsurat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Run Migrations

```powershell
alembic upgrade head
```

This will:
- ✅ Create all database tables
- ✅ Seed default categories (7 categories)
- ✅ Seed default settings (10 settings)

### 7. Start the Server

```powershell
uvicorn app.main:app --reload
```

**🎉 On first startup, the app will automatically:**
- Check if any users exist
- Create default super admin if database is empty
  - Username: `admin`
  - Password: `admin123`
  - ⚠️ **CHANGE THIS PASSWORD AFTER FIRST LOGIN!**

---

## Running the Application

### Development Mode (with auto-reload)

```powershell
uvicorn app.main:app --reload
```

### Production Mode

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### With Specific Host/Port

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

---

## Access Points

- **API Server:** http://localhost:8000
- **Swagger UI (Interactive Docs):** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **API Base:** http://localhost:8000/api/v1

---

## Default Credentials

**Super Admin (Auto-created on first run):**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

---

## Default Data

### Categories (Auto-seeded)

1. **UND** - Undangan
2. **PNG** - Pengumuman
3. **PMH** - Permohonan
4. **LPR** - Laporan
5. **TGS** - Surat Tugas
6. **EDR** - Edaran
7. **LLL** - Lain-lain

### Settings (Auto-seeded)

- `app_name` - "Arsip Surat POLDA"
- `max_file_size` - 10MB
- `allowed_file_types` - .pdf,.doc,.docx,.jpg,.jpeg,.png
- And 7 more...

---

## Database Management

### Reset Database (⚠️ Deletes all data!)

```powershell
# Option 1: Using SQL script
mysql -u root -p arsipsurat < reset_database.sql

# Option 2: Manual
mysql -u root -p
DROP DATABASE arsipsurat;
CREATE DATABASE arsipsurat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run migrations again:
```powershell
alembic upgrade head
```

### Create Additional Admin User Manually

```powershell
python create_admin.py
```

---

## Common Issues

### Issue: `ModuleNotFoundError`
**Solution:** Activate virtual environment
```powershell
.venv\Scripts\activate
```

### Issue: Database connection failed
**Solution:** Check MySQL is running and credentials in `.env` are correct

### Issue: Alembic migrations fail
**Solution:** Reset database and run migrations again

### Issue: OCR not working
**Solution:** Install Tesseract OCR and set path in `.env`:
```env
TESSERACT_CMD=C:/Program Files/Tesseract-OCR/tesseract.exe
```

### Issue: File upload fails
**Solution:** 
- Check `storage/` directory exists and is writable
- Check file size < 10MB
- Check file type is allowed

---

## Development Workflow

1. **Make code changes**
2. **Server auto-reloads** (in `--reload` mode)
3. **Test in Swagger** (http://localhost:8000/docs)
4. **Commit changes**

### Creating New Migration

```powershell
# Auto-generate migration
alembic revision --autogenerate -m "description"

# Manual migration
alembic revision -m "description"

# Apply migration
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## API Testing

### Using Swagger UI

1. Go to http://localhost:8000/docs
2. Click "Authorize" button
3. Login via `/auth/login`
4. Copy the `access_token`
5. Enter: `Bearer <token>`
6. Test endpoints

### Using curl

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get categories
curl -X GET http://localhost:8000/api/v1/kategori \
  -H "Authorization: Bearer <token>"
```

---

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   └── versions/         # Migration files
├── app/
│   ├── api/v1/          # API endpoints
│   │   └── endpoints/   # 10 endpoint modules
│   ├── core/            # Config, security
│   ├── models/          # SQLAlchemy models (8 tables)
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── main.py          # FastAPI app
├── storage/             # Uploaded files
├── .env                 # Environment config
├── requirements.txt     # Dependencies
└── HOW_TO_RUN.md       # This file
```

---

## Production Deployment

### Using Gunicorn (Recommended)

```powershell
pip install gunicorn

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

### Using Docker (Future)

```dockerfile
# Dockerfile coming soon
```

---

## Monitoring

### Check Logs

```powershell
# In development mode, logs appear in console
```

### Health Check

```bash
curl http://localhost:8000/api/v1/
```

---

## Security Notes

1. ✅ **Change default admin password** after first login
2. ✅ Set strong `SECRET_KEY` in `.env`
3. ✅ Use HTTPS in production
4. ✅ Restrict CORS origins
5. ✅ Keep dependencies updated
6. ✅ Use environment-specific `.env` files

---

## Need Help?

- Check **Swagger Docs:** http://localhost:8000/docs
- Read **API Documentation:** `FRONTEND_API_DOCS.md`
- Check logs in console

---

**Last Updated:** February 11, 2026  
**Version:** 1.0

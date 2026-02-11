# Running the Backend Server

## Quick Start Commands

### Option 1: Using Uvicorn (Recommended)
```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Using Python
```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run as module
python -m uvicorn app.main:app --reload
```

### Option 3: Direct Python (if __main__ block exists)
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.main
```

## What Each Command Does

- `uvicorn` - ASGI server for FastAPI
- `app.main:app` - Module path to the FastAPI application
  - `app.main` = the `app/main.py` file
  - `:app` = the `app` variable inside that file
- `--reload` - Auto-reload on code changes (development only)
- `--host 0.0.0.0` - Accept connections from any IP
- `--port 8000` - Run on port 8000

## Access the Application

Once running, you can access:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Common Errors and Solutions

### Error: `ModuleNotFoundError: No module named 'app'`
**Solution**: Make sure you're running from the `backend` directory, not from `backend/app`.

### Error: `No such file or directory: 'storage'`
**Solution**: The static files mount needs the storage directory to exist. Run:
```powershell
mkdir storage\surat_masuk
mkdir storage\surat_keluar
```

### Error: `.env` file not found
**Solution**: Copy the example file:
```powershell
cp .env.example .env
# Then edit .env with your values
```

## Environment Configuration

Make sure your `.env` file has the correct values:
- `DATABASE_URL` - Your MySQL connection string
- `SECRET_KEY` - Change to a secure random key
- `CORS_ORIGINS` - Frontend URLs (comma-separated)

## Testing the Server

### 1. Check if it's running
```powershell
curl http://localhost:8000/health
```

Expected: `{"status":"healthy"}`

### 2. View API documentation
Open browser: http://localhost:8000/docs

### 3. Test authentication endpoint
```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=admin&password=admin123"
```

## Production Deployment

For production, use Gunicorn with Uvicorn workers:
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

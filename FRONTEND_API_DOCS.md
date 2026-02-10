# FastAPI Backend - API Documentation for Frontend Team

**Project:** Sistem Klasifikasi Arsip Surat  
**Backend Framework:** FastAPI  
**Base URL:** `http://localhost:8000/api/v1`  
**Documentation:** `http://localhost:8000/docs` (Swagger UI)

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [Common Response Formats](#common-response-formats)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Surat Masuk Endpoints](#surat-masuk-endpoints)
6. [Surat Keluar Endpoints](#surat-keluar-endpoints)
7. [Disposisi Endpoints](#disposisi-endpoints)
8. [Dashboard Endpoints](#dashboard-endpoints)
9. [Export/Report Endpoints](#export-endpoints)
10. [User Management Endpoints](#user-management-endpoints)
11. [Error Handling](#error-handling)
12. [File Upload Guide](#file-upload-guide)

---

## Authentication

### Authentication Flow

1. **Login** → Receive JWT access token + refresh token
2. **Include token** in all subsequent requests
3. **Refresh token** when access token expires

### How to Include Token

```javascript
// Using Axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## API Endpoints Overview

### Base Structure
```
/api/v1/
├── /auth/              # Authentication
├── /surat-masuk/       # Incoming mail
├── /surat-keluar/      # Outgoing mail
├── /kategori/          # Categories
├── /disposisi/         # Mail disposition
├── /notifikasi/        # Notifications
├── /dashboard/         # Dashboard analytics
├── /reports/           # Export reports
└── /users/             # User management
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "detail": "Detailed error message",
  "error_code": "ERROR_CODE"
}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "Administrator",
      "role": "admin"
    }
  }
}
```

### 2. Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_token_here",
    "token_type": "bearer"
  }
}
```

### 3. Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Administrator",
    "role": "admin",
    "is_active": true
  }
}
```

### 4. Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {token}`

---

## Surat Masuk Endpoints

### 1. Get All Surat Masuk
**GET** `/surat-masuk/`

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20)
- `search` (string): Search by nomor surat or pengirim
- `kategori_id` (int): Filter by category
- `start_date` (date): Filter by date range
- `end_date` (date)
- `status` (string): "pending", "approved", "rejected"

**Example:**
```
GET /surat-masuk/?page=1&per_page=20&kategori_id=3&search=undangan
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nomor_surat": "001/SM/2026",
      "tanggal_surat": "2026-02-01",
      "tanggal_terima": "2026-02-03",
      "pengirim": "Dinas Pendidikan",
      "perihal": "Undangan Rapat Koordinasi",
      "kategori": {
        "id": 1,
        "nama": "Undangan",
        "slug": "undangan"
      },
      "file_path": "/storage/surat_masuk/2026/02/file.pdf",
      "status": "approved",
      "confidence_score": 95.5,
      "ocr_text": "Extracted text from document...",
      "created_at": "2026-02-03T10:30:00",
      "updated_at": "2026-02-03T10:30:00"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

### 2. Get Surat Masuk by ID
**GET** `/surat-masuk/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nomor_surat": "001/SM/2026",
    "tanggal_surat": "2026-02-01",
    "tanggal_terima": "2026-02-03",
    "pengirim": "Dinas Pendidikan",
    "perihal": "Undangan Rapat Koordinasi",
    "kategori": {
      "id": 1,
      "nama": "Undangan"
    },
    "file_path": "/storage/surat_masuk/2026/02/file.pdf",
    "file_url": "http://localhost:8000/files/surat_masuk/2026/02/file.pdf",
    "status": "approved",
    "confidence_score": 95.5,
    "ocr_text": "Full extracted text...",
    "keywords_detected": ["undangan", "rapat", "koordinasi"],
    "disposisi": [
      {
        "id": 1,
        "kepada": "Kepala Bagian",
        "catatan": "Harap dihadiri",
        "status": "read",
        "created_at": "2026-02-03T11:00:00"
      }
    ],
    "created_by": {
      "id": 1,
      "username": "admin",
      "full_name": "Administrator"
    },
    "created_at": "2026-02-03T10:30:00",
    "updated_at": "2026-02-03T10:30:00"
  }
}
```

### 3. Create Surat Masuk (with File Upload)
**POST** `/surat-masuk/`

**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: [File] (required) - PDF, Word, or Image
nomor_surat: string (optional, auto-extracted if not provided)
tanggal_surat: date (optional, auto-extracted)
tanggal_terima: date (required)
pengirim: string (optional, auto-extracted)
perihal: string (optional)
kategori_id: int (optional, auto-classified)
```

**Example using JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('tanggal_terima', '2026-02-10');
formData.append('pengirim', 'Dinas Pendidikan');

const response = await api.post('/surat-masuk/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

**Response:**
```json
{
  "success": true,
  "message": "Surat masuk berhasil ditambahkan",
  "data": {
    "id": 123,
    "nomor_surat": "123/SM/2026",
    "kategori": {
      "id": 1,
      "nama": "Undangan"
    },
    "confidence_score": 85.5,
    "status": "review_needed",
    "file_url": "http://localhost:8000/files/..."
  }
}
```

### 4. Update Surat Masuk
**PUT** `/surat-masuk/{id}`

**Request Body:**
```json
{
  "nomor_surat": "001/SM/2026",
  "tanggal_surat": "2026-02-01",
  "pengirim": "Dinas Pendidikan Updated",
  "perihal": "Updated subject",
  "kategori_id": 2,
  "status": "approved"
}
```

### 5. Delete Surat Masuk
**DELETE** `/surat-masuk/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Surat masuk berhasil dihapus"
}
```

---

## Surat Keluar Endpoints

### Structure Similar to Surat Masuk

**Endpoints:**
- `GET /surat-keluar/` - Get all
- `GET /surat-keluar/{id}` - Get by ID
- `POST /surat-keluar/` - Create (with file upload)
- `PUT /surat-keluar/{id}` - Update
- `DELETE /surat-keluar/{id}` - Delete

**Fields:**
```json
{
  "id": 1,
  "nomor_surat": "001/SK/2026",
  "tanggal_surat": "2026-02-10",
  "tujuan": "Dinas Kesehatan",
  "perihal": "Permohonan Data",
  "kategori": {...},
  "file_path": "/storage/surat_keluar/...",
  "status": "sent"
}
```

---

## Disposisi Endpoints

### 1. Create Disposisi
**POST** `/disposisi/`

**Request Body:**
```json
{
  "surat_id": 123,
  "surat_type": "masuk",
  "tujuan_user_id": 5,
  "catatan": "Harap ditindaklanjuti segera",
  "prioritas": "high",
  "deadline": "2026-02-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Disposisi berhasil dibuat",
  "data": {
    "id": 45,
    "surat_id": 123,
    "dari": {
      "id": 1,
      "full_name": "Administrator"
    },
    "kepada": {
      "id": 5,
      "full_name": "Kepala Bagian"
    },
    "catatan": "Harap ditindaklanjuti segera",
    "prioritas": "high",
    "status": "pending",
    "deadline": "2026-02-15",
    "created_at": "2026-02-10T14:00:00"
  }
}
```

### 2. Get My Disposisi
**GET** `/disposisi/me`

**Query Parameters:**
- `status` (string): "pending", "read", "completed"
- `page`, `per_page`

### 3. Update Disposisi Status
**PATCH** `/disposisi/{id}/status`

**Request Body:**
```json
{
  "status": "completed",
  "keterangan": "Sudah ditindaklanjuti"
}
```

---

## Dashboard Endpoints

### 1. Get Dashboard Statistics
**GET** `/dashboard/stats`

**Query Parameters:**
- `period` (string): "today", "week", "month", "year"

**Response:**
```json
{
  "success": true,
  "data": {
    "surat_masuk_count": 156,
    "surat_masuk_change": "+12%",
    "surat_keluar_count": 89,
    "surat_keluar_change": "+8%",
    "pending_classification": 12,
    "completed_today": 43,
    "trend_data": {
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "surat_masuk": [120, 135, 142, 150, 148, 156],
      "surat_keluar": [80, 85, 82, 88, 86, 89]
    },
    "kategori_distribution": [
      {"kategori": "Undangan", "count": 45, "percentage": 28.8},
      {"kategori": "Pengumuman", "count": 38, "percentage": 24.3},
      {"kategori": "Permohonan", "count": 32, "percentage": 20.5}
    ]
  }
}
```

### 2. Get Recent Activities
**GET** `/dashboard/activities`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": "Admin User",
      "action": "created",
      "resource": "surat_masuk",
      "resource_id": 123,
      "description": "Menambahkan surat masuk #123",
      "created_at": "2026-02-10T13:45:00"
    }
  ]
}
```

---

## Export Endpoints

### 1. Export to Excel
**POST** `/reports/export/excel`

**Request Body:**
```json
{
  "type": "surat_masuk",
  "filters": {
    "start_date": "2026-01-01",
    "end_date": "2026-02-10",
    "kategori_id": 1
  },
  "columns": ["nomor_surat", "tanggal_surat", "pengirim", "perihal", "kategori"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "http://localhost:8000/downloads/export_123456.xlsx",
    "filename": "surat_masuk_2026-02-10.xlsx",
    "expires_at": "2026-02-10T15:00:00"
  }
}
```

### 2. Export to PDF
**POST** `/reports/export/pdf`

(Similar structure to Excel)

### 3. Export to Google Sheets
**POST** `/reports/export/google-sheets`

**Response:**
```json
{
  "success": true,
  "data": {
    "sheet_url": "https://docs.google.com/spreadsheets/d/...",
    "sheet_id": "1ABC..."
  }
}
```

---

## User Management Endpoints

### 1. Get All Users
**GET** `/users/`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "full_name": "Administrator",
      "role": "admin",
      "is_active": true
    }
  ]
}
```

### 2. Create User
**POST** `/users/`

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "full_name": "New User",
  "password": "password123",
  "role": "staff"
}
```

---

## Error Handling

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `FILE_TOO_LARGE` | 413 | File exceeds 10MB limit |
| `INVALID_FILE_TYPE` | 400 | Unsupported file format |
| `OCR_FAILED` | 500 | OCR processing failed |

### Error Response Example
```json
{
  "success": false,
  "message": "Validation error",
  "detail": "Field 'tanggal_terima' is required",
  "error_code": "VALIDATION_ERROR"
}
```

### Frontend Error Handling Example
```javascript
try {
  const response = await api.post('/surat-masuk/', data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { message, error_code } = error.response.data;
    
    if (error_code === 'UNAUTHORIZED') {
      // Redirect to login
      window.location.href = '/login';
    } else {
      // Show error message
      toast.error(message);
    }
  }
}
```

---

## File Upload Guide

### Supported File Types
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Images (`.jpg`, `.jpeg`, `.png`)

### File Size Limit
- Maximum: **10MB per file**

### Upload Example (React)
```javascript
import { useState } from 'react';
import axios from 'axios';

function UploadForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tanggal_terima', new Date().toISOString().split('T')[0]);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/surat-masuk/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      console.log('Upload successful:', response.data);
      // Handle success (show message, redirect, etc.)
    } catch (error) {
      console.error('Upload failed:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <button type="submit" disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

---

## WebSocket (Real-time Notifications)

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/notifications?token=YOUR_TOKEN');

ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('New notification:', notification);
  // Update UI with new notification
};
```

### Notification Format
```json
{
  "type": "new_disposisi",
  "data": {
    "id": 45,
    "message": "Anda menerima disposisi baru",
    "surat_id": 123,
    "from_user": "Administrator"
  },
  "timestamp": "2026-02-10T14:30:00"
}
```

---

## Development Setup

### 1. Install Backend
```bash
# Clone repo
git clone <repo-url>
cd arsipsurat
git checkout backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### 2. API Documentation
Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Notes for Frontend Team

1. **Always include Authorization header** for protected endpoints
2. **Handle token expiration** - implement refresh token logic
3. **File uploads** use `multipart/form-data`
4. **Date format** is ISO 8601: `YYYY-MM-DD`
5. **Pagination** uses `page` and `per_page` query params
6. **Search/Filter** uses query parameters
7. **OCR results** include `confidence_score` - show UI indicator if < 70%
8. **WebSocket** for real-time notifications (optional for MVP)

---

## Contact

For questions or issues with the backend API:
- Check Swagger docs: `http://localhost:8000/docs`
- Contact backend team member

**Last Updated:** 10 Februari 2026

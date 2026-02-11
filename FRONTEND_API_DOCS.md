# Arsip Surat - Frontend API Documentation

**Project:** Sistem Klasifikasi Arsip Surat POLDA  
**Backend:** FastAPI + MySQL  
**Base URL:** `http://localhost:8000/api/v1`  
**API Docs:** `http://localhost:8000/docs` (Swagger UI)  
**Version:** 1.0  
**Last Updated:** February 11, 2026

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Kategori](#2-kategori)
3. [Surat Masuk](#3-surat-masuk)
4. [Surat Keluar](#4-surat-keluar)
5. [Disposisi](#5-disposisi)
6. [Notifications](#6-notifications)
7. [Dashboard](#7-dashboard)
8. [Audit Logs](#8-audit-logs)
9. [Settings](#9-settings)
10. [Reports & Export](#10-reports--export)
11. [Common Patterns](#common-patterns)
12. [Error Handling](#error-handling)

---

## Overview

**Total Endpoints:** 50  
**Authentication:** JWT Bearer Token  
**Database:** MySQL 8.0+

### API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Authentication | 3 | Login, logout, get current user |
| Kategori | 5 | Category management |
| Surat Masuk | 7 | Incoming mail with OCR |
| Surat Keluar | 6 | Outgoing mail with auto-numbering |
| Disposisi | 6 | Letter routing & tracking |
| Notifications | 7 | User notifications |
| Dashboard | 4 | Analytics & metrics |
| Audit Logs | 4 | Activity tracking (admin only) |
| Settings | 5 | App configuration |
| Reports | 4 | Excel/PDF export |

---

## 1. Authentication

### 1.1 Login
**POST** `/auth/login`

**Accepts:** Username OR Email

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Or using email:
```json
{
  "username": "admin@arsipsurat.local",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### 1.2 Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {token}`

### 1.3 Get Current User
**GET** `/auth/me`

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "Administrator",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-02-01T10:00:00"
}
```

---

## 2. Kategori

### 2.1 List Categories
**GET** `/kategori`

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100)
- `is_active` (bool, optional)

**Response:**
```json
[
  {
    "id": 1,
    "nama": "Undangan",
    "slug": "und",
    "deskripsi": "Surat Undangan",
    "color": "#3B82F6",
    "is_active": true,
    "created_at": "2026-02-01T10:00:00"
  }
]
```

### 2.2 Get Category Detail
**GET** `/kategori/{id}`

### 2.3 Create Category (Admin Only)
**POST** `/kategori`

**Request:**
```json
{
  "nama": "Surat Tugas",
  "slug": "tgs",
  "deskripsi": "Surat penugasan",
  "color": "#10B981"
}
```

### 2.4 Update Category (Admin Only)
**PUT** `/kategori/{id}`

### 2.5 Delete Category (Admin Only)
**DELETE** `/kategori/{id}`

---

## 3. Surat Masuk

### 3.1 List Surat Masuk
**GET** `/surat-masuk`

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 20)
- `search` (string): Search nomor_surat, pengirim, perihal
- `kategori_id` (int): Filter by category
- `status` (string): pending, proses, selesai
- `priority` (string): rendah, sedang, tinggi, mendesak

**Response:**
```json
[
  {
    "id": 1,
    "nomor_surat": "001/SM/2026",
    "tanggal_surat": "2026-02-01",
    "tanggal_terima": "2026-02-03",
    "pengirim": "Dinas Pendidikan",
    "perihal": "Undangan Rapat Koordinasi",
    "kategori_id": 1,
    "kategori": {
      "id": 1,
      "nama": "Undangan",
      "slug": "und"
    },
    "status": "proses",
    "priority": "sedang",
    "file_path": "storage/surat_masuk/2026/02/file.pdf",
    "ocr_text": "Extracted text...",
    "ocr_keywords": ["undangan", "rapat", "koordinasi"],
    "confidence_score": 95.5,
    "created_by": 1,
    "created_at": "2026-02-03T10:30:00"
  }
]
```

### 3.2 Get Surat Masuk Detail
**GET** `/surat-masuk/{id}`

### 3.3 Create Surat Masuk (with File Upload)
**POST** `/surat-masuk`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File, required): PDF, DOC, DOCX, JPG, PNG (max 10MB)
- `nomor_surat` (string, optional): Auto-extracted if empty
- `tanggal_surat` (date, required): YYYY-MM-DD
- `tanggal_terima` (date, required): YYYY-MM-DD
- `pengirim` (string, required)
- `perihal` (string, required)
- `kategori_id` (int, optional): Auto-classified if empty
- `status` (string, default: "pending")
- `priority` (string, default: "sedang")

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('nomor_surat', '001/SM/2026');
formData.append('tanggal_surat', '2026-02-01');
formData.append('tanggal_terima', '2026-02-03');
formData.append('pengirim', 'Dinas Pendidikan');
formData.append('perihal', 'Undangan Rapat');
formData.append('kategori_id', '1');

const response = await axios.post('/api/v1/surat-masuk', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

**Response:**
```json
{
  "id": 123,
  "nomor_surat": "001/SM/2026",
  "file_path": "storage/surat_masuk/2026/02/123_file.pdf",
  "ocr_text": "Extracted text from OCR...",
  "confidence_score": 92.3,
  "kategori": {
    "id": 1,
    "nama": "Undangan"
  }
}
```

### 3.4 Update Surat Masuk
**PUT** `/surat-masuk/{id}`

**Request:**
```json
{
  "nomor_surat": "001/SM/2026",
  "tanggal_surat": "2026-02-01",
  "pengirim": "Updated Sender",
  "perihal": "Updated Subject",
  "kategori_id": 2,
  "status": "selesai"
}
```

### 3.5 Delete Surat Masuk
**DELETE** `/surat-masuk/{id}`

**Response:** 204 No Content

### 3.6 Download File
**GET** `/surat-masuk/{id}/file`

Returns file directly (PDF, DOC, or image)

### 3.7 Reprocess OCR
**POST** `/surat-masuk/{id}/process-ocr`

Manually trigger OCR reprocessing

---

## 4. Surat Keluar

### 4.1 List Surat Keluar
**GET** `/surat-keluar`

**Query Parameters:** (same as Surat Masuk)

**Response:**
```json
[
  {
    "id": 1,
    "nomor_surat_keluar": "001/SK/POLDA/II/2026",
    "tanggal_surat": "2026-02-10",
    "penerima": "Dinas Kesehatan",
    "perihal": "Permohonan Data",
    "kategori_id": 3,
    "status": "proses",
    "priority": "sedang",
    "file_path": "storage/surat_keluar/2026/02/file.pdf"
  }
]
```

### 4.2 Get Surat Keluar Detail
**GET** `/surat-keluar/{id}`

### 4.3 Create Surat Keluar (with Auto-Numbering)
**POST** `/surat-keluar`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file` (File, required)
- `tanggal_surat` (date, required)
- `penerima` (string, required)
- `perihal` (string, required)
- `kategori_id` (int, required)
- `status` (string, default: "pending")
- `priority` (string, default: "sedang")

**Note:** `nomor_surat_keluar` is auto-generated: `001/SK/POLDA/MM/YYYY`

### 4.4 Update Surat Keluar
**PUT** `/surat-keluar/{id}`

### 4.5 Delete Surat Keluar
**DELETE** `/surat-keluar/{id}`

### 4.6 Download File
**GET** `/surat-keluar/{id}/file`

---

## 5. Disposisi

### 5.1 Create Disposisi
**POST** `/disposisi`

**Request:**
```json
{
  "surat_type": "masuk",
  "surat_masuk_id": 123,
  "to_user_id": 5,
  "instruksi": "Harap ditindaklanjuti segera",
  "keterangan": "Prioritas tinggi",
  "deadline": "2026-02-15"
}
```

**Response:**
```json
{
  "id": 45,
  "surat_type": "masuk",
  "surat_masuk_id": 123,
  "from_user_id": 1,
  "to_user_id": 5,
  "instruksi": "Harap ditindaklanjuti segera",
  "keterangan": "Prioritas tinggi",
  "status": "PENDING",
  "deadline": "2026-02-15",
  "created_at": "2026-02-10T14:00:00"
}
```

### 5.2 List Disposisi
**GET** `/disposisi`

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 20)
- `status` (string): PENDING, PROSES, SELESAI
- `surat_type` (string): masuk, keluar

**Response:** Array of disposisi items filtered by current user (sender or receiver)

### 5.3 Get Disposisi Detail
**GET** `/disposisi/{id}`

### 5.4 Mark as Complete
**PUT** `/disposisi/{id}/complete`

**Request:**
```json
{
  "keterangan": "Sudah ditindaklanjuti"
}
```

### 5.5 Update Disposisi
**PUT** `/disposisi/{id}`

### 5.6 Delete Disposisi
**DELETE** `/disposisi/{id}`

---

## 6. Notifications

### 6.1 List Notifications
**GET** `/notifications`

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 20)
- `is_read` (bool, optional)
- `tipe` (string): surat_masuk, surat_keluar, disposisi, deadline, status_update, system

**Response:**
```json
[
  {
    "id": 1,
    "tipe": "disposisi",
    "judul": "Disposisi Baru",
    "pesan": "Anda menerima disposisi baru dari Administrator",
    "is_read": false,
    "created_at": "2026-02-10T14:30:00"
  }
]
```

### 6.2 Get Notification Stats
**GET** `/notifications/stats`

**Response:**
```json
{
  "total": 45,
  "unread": 12,
  "by_type": {
    "disposisi": 20,
    "surat_masuk": 15,
    "deadline": 10
  }
}
```

### 6.3 Get Notification Detail
**GET** `/notifications/{id}`

### 6.4 Mark as Read
**PUT** `/notifications/{id}/read`

### 6.5 Mark All as Read
**PUT** `/notifications/read-all`

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### 6.6 Delete Notification
**DELETE** `/notifications/{id}`

---

## 7. Dashboard

### 7.1 Get Dashboard Stats
**GET** `/dashboard/stats`

**Response:**
```json
{
  "total_surat_masuk": 156,
  "total_surat_keluar": 89,
  "surat_masuk_bulan_ini": 23,
  "surat_keluar_bulan_ini": 12,
  "disposisi_pending": 8,
  "disposisi_selesai": 45,
  "notifikasi_unread": 12,
  "total_kategori": 7
}
```

### 7.2 Get Recent Activity
**GET** `/dashboard/recent`

**Query Parameters:**
- `limit` (int, default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "type": "surat_masuk",
    "title": "Surat Masuk: 001/SM/2026",
    "description": "Undangan Rapat Koordinasi",
    "created_at": "2026-02-10T13:45:00",
    "link": "/surat-masuk/1"
  }
]
```

### 7.3 Chart Data by Category
**GET** `/dashboard/charts/by-kategori`

**Query Parameters:**
- `jenis` (string, default: "masuk"): masuk or keluar

**Response:**
```json
[
  {
    "label": "Undangan",
    "value": 45,
    "color": "#3B82F6"
  },
  {
    "label": "Pengumuman",
    "value": 38,
    "color": "#10B981"
  }
]
```

### 7.4 Chart Data by Month
**GET** `/dashboard/charts/by-month`

**Query Parameters:**
- `months` (int, default: 6): Last N months

**Response:**
```json
[
  {
    "label": "Jan 2026",
    "value": 120,
    "color": "#3B82F6"
  },
  {
    "label": "Feb 2026",
    "value": 135,
    "color": "#3B82F6"
  }
]
```

---

## 8. Audit Logs

**Admin Only** - All endpoints require admin role

### 8.1 List Audit Logs
**GET** `/audit`

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 50)
- `action` (string): CREATE, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILED
- `table_name` (string): users, surat_masuk, surat_keluar, etc.
- `user_id` (int)
- `days` (int, default: 30, max: 365): Last N days

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "action": "CREATE",
    "table_name": "surat_masuk",
    "record_id": 123,
    "description": "Created surat_masuk record #123",
    "created_at": "2026-02-10T14:00:00"
  }
]
```

### 8.2 Get Audit Stats
**GET** `/audit/stats`

**Query Parameters:**
- `days` (int, default: 30, max: 365)

**Response:**
```json
{
  "total": 1250,
  "by_action": {
    "CREATE": 450,
    "UPDATE": 380,
    "DELETE": 20,
    "LOGIN_SUCCESS": 400
  },
  "by_table": {
    "surat_masuk": 520,
    "surat_keluar": 310,
    "disposisi": 230
  },
  "by_user": {
    "user_1": 800,
    "user_2": 450
  }
}
```

### 8.3 Get Audit Detail
**GET** `/audit/{id}`

**Response:** Full audit log including old_data and new_data JSON

### 8.4 Get User Audit History
**GET** `/audit/user/{user_id}`

**Query Parameters:**
- `skip`, `limit`, `days` (same as list)

---

## 9. Settings

### 9.1 Get Public Settings
**GET** `/settings/public`

**No authentication required**

**Response:**
```json
[
  {
    "setting_key": "app_name",
    "setting_value": "Arsip Surat POLDA",
    "description": "Nama aplikasi",
    "is_public": true
  },
  {
    "setting_key": "max_file_size",
    "setting_value": "10485760",
    "description": "Ukuran file maksimal (bytes) - 10MB",
    "is_public": true
  }
]
```

### 9.2 Get All Settings (Admin Only)
**GET** `/settings`

**Response:** Array of all settings including private ones

### 9.3 Get Specific Setting
**GET** `/settings/{setting_key}`

**Public settings:** Anyone can view  
**Private settings:** Admin only

**Response:**
```json
{
  "id": 1,
  "setting_key": "app_name",
  "setting_value": "Arsip Surat POLDA",
  "setting_type": "string",
  "description": "Nama aplikasi",
  "is_public": true,
  "updated_by": 1,
  "updated_at": "2026-02-01T10:00:00"
}
```

### 9.4 Update Setting (Admin Only)
**PUT** `/settings/{setting_key}`

**Request:**
```json
{
  "setting_value": "New Value"
}
```

### 9.5 Reset to Defaults (Admin Only)
**POST** `/settings/reset`

---

## 10. Reports & Export

### 10.1 Export Surat Masuk to Excel
**GET** `/reports/surat-masuk/excel`

**Query Parameters:**
- `start_date` (string, optional): YYYY-MM-DD
- `end_date` (string, optional): YYYY-MM-DD
- `kategori_id` (int, optional)

**Response:** Excel file download (`.xlsx`)

### 10.2 Export Surat Masuk to PDF
**GET** `/reports/surat-masuk/pdf`

**Query Parameters:** (same as Excel)

**Response:** PDF file download

### 10.3 Export Surat Keluar to Excel
**GET** `/reports/surat-keluar/excel`

**Query Parameters:** (same as Surat Masuk)

### 10.4 Export Surat Keluar to PDF
**GET** `/reports/surat-keluar/pdf`

**Query Parameters:** (same as Surat Masuk)

**JavaScript Example:**
```javascript
// Download Excel
const params = new URLSearchParams({
  start_date: '2026-01-01',
  end_date: '2026-02-10',
  kategori_id: '1'
});

const response = await axios.get(
  `/api/v1/reports/surat-masuk/excel?${params}`,
  {
    headers: { 'Authorization': `Bearer ${token}` },
    responseType: 'blob'
  }
);

// Create download link
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'surat_masuk.xlsx');
document.body.appendChild(link);
link.click();
```

---

## Common Patterns

### Authentication Header

All protected endpoints require JWT token:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### File Upload

Use `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('field_name', 'value');

axios.post('/endpoint', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

### Pagination

Use `skip` and `limit`:

```
GET /surat-masuk?skip=0&limit=20   # Page 1
GET /surat-masuk?skip=20&limit=20  # Page 2
```

### Search & Filters

Use query parameters:

```
GET /surat-masuk?search=undangan&kategori_id=1&status=proses
```

### Date Format

Always use ISO format: `YYYY-MM-DD`

```
{
  "tanggal_surat": "2026-02-10",
  "tanggal_terima": "2026-02-10"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

### Error Response Format

```json
{
  "detail": "Error message here"
}
```

### Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Frontend Error Handling

```javascript
try {
  const response = await api.post('/endpoint', data);
} catch (error) {
  if (error.response) {
    const status = error.response.status;
    const detail = error.response.data.detail;
    
    if (status === 401) {
      // Token expired - redirect to login
      router.push('/login');
    } else if (status === 422) {
      // Validation error - show field errors
      console.error('Validation errors:', detail);
    } else {
      // Other errors
      console.error('Error:', detail);
    }
  }
}
```

---

## Default Settings

**Seeded on first run:**

| Key | Value | Public | Description |
|-----|-------|--------|-------------|
| app_name | "Arsip Surat POLDA" | ✅ | Application name |
| max_file_size | "10485760" | ✅ | Max file size (10MB) |
| allowed_file_types | ".pdf,.doc,.docx,.jpg,.jpeg,.png" | ✅ | Allowed file types |
| ocr_language | "ind+eng" | ❌ | OCR language |
| items_per_page | "10" | ✅ | Default pagination |
| session_timeout | "3600" | ❌ | Session timeout (1 hour) |
| enable_ocr | "true" | ❌ | Enable auto-OCR |
| auto_classification | "true" | ❌ | Auto-classify |
| storage_path | "storage" | ❌ | File storage path |
| email_notifications | "false" | ❌ | Email notifications |

---

## Default Categories

**Seeded on first run:**

1. **UND** - Undangan
2. **PNG** - Pengumuman
3. **PMH** - Permohonan
4. **LPR** - Laporan
5. **TGS** - Surat Tugas
6. **EDR** - Edaran
7. **LLL** - Lain-lain

---

## Development Setup

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Access
http://localhost:8000          # API
http://localhost:8000/docs     # Swagger UI
http://localhost:8000/redoc    # ReDoc
```

**Default Admin:**
- Username: `admin`
- Password: `admin123`

---

## Notes for Frontend

1. ✅ **Always** include `Authorization` header for protected endpoints
2. ✅ Token stored in localStorage/sessionStorage
3. ✅ Handle 401 errors → redirect to login
4. ✅ File uploads use `multipart/form-data`
5. ✅ Date format: `YYYY-MM-DD`
6. ✅ Pagination: `skip` & `limit` params
7. ✅ OCR confidence score: Show warning if < 70%
8. ✅ Soft delete: Items have `deleted_at` field
9. ✅ Base URL: `http://localhost:8000/api/v1`
10. ✅ Interactive Docs: `http://localhost:8000/docs`

---

## Contact

For API questions:
- Check Swagger: http://localhost:8000/docs
- Backend team

**Last Updated:** February 11, 2026  
**Version:** 1.0  
**Backend Branch:** `backend`

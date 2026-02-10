# PERANCANGAN WEB KLASIFIKASI ARSIP SURAT MASUK DAN SURAT KELUAR

**Dokumen Perancangan Sistem**  
**Versi:** 1.0  
**Tanggal:** 09 Februari 2026  
**Status:** Final untuk Review

---

## DAFTAR ISI

1. [Tentang dan Tujuan](#1-tentang-dan-tujuan)
2. [Tech Stack](#2-tech-stack)
3. [Flowchart dan Alur Kerja Aplikasi](#3-flowchart-dan-alur-kerja-aplikasi)
4. [Rancangan UI/UX](#4-rancangan-uiux)
5. [Halaman-Halaman](#5-halaman-halaman)
6. [Features](#6-features)
7. [Database Design](#7-database-design)
8. [Security & Performance](#8-security--performance)
9. [Deployment Plan](#9-deployment-plan)
10. [Timeline & Milestones](#10-timeline--milestones)
11. [Koreksi & Rekomendasi Final](#11-koreksi--rekomendasi-final)
12. [Kesimpulan](#12-kesimpulan)

---

## 1. TENTANG DAN TUJUAN

### 1.1 Latar Belakang

Pengelolaan surat masuk dan surat keluar di instansi/kantor seringkali masih dilakukan secara manual atau semi-digital. Hal ini menimbulkan beberapa permasalahan:

- Kesulitan dalam pencarian dan pelacakan arsip surat
- Proses klasifikasi surat yang memakan waktu
- Risiko kehilangan dokumen fisik
- Keterbatasan dalam pembuatan laporan dan analisis
- Tidak adanya sistem tracking disposisi surat

Dengan adanya sistem digitalisasi dan otomatisasi, diharapkan proses pengelolaan surat menjadi lebih efisien dan terstruktur.

### 1.2 Tujuan Sistem

1. **Digitalisasi Arsip**: Mengubah dokumen fisik menjadi digital untuk kemudahan akses
2. **Otomatisasi Klasifikasi**: Menggunakan OCR untuk ekstraksi teks dan klasifikasi otomatis berbasis keyword matching
3. **Efisiensi Kerja**: Mempercepat proses input, pencarian, dan disposisi surat
4. **Transparansi**: Tracking status surat dan disposisi secara real-time
5. **Pelaporan**: Kemudahan dalam membuat laporan dan analisis data surat
6. **Keamanan Data**: Sistem authentication dan authorization untuk keamanan data

### 1.3 Ruang Lingkup

**Cakupan Sistem:**
- Manajemen surat masuk
- Manajemen surat keluar
- Upload dan scan dokumen (PDF, Word, Image)
- OCR untuk ekstraksi teks otomatis
- Klasifikasi otomatis berbasis keyword matching
- Dashboard analytics
- Export laporan (Excel, PDF, Google Sheets)
- User management dan role-based access
- Disposisi surat
- Notifikasi dan reminder
- Audit trail dan logging

**Batasan Sistem:**
- Tidak menggunakan Machine Learning/AI kompleks
- Klasifikasi berbasis rule-based dan keyword matching
- Fokus pada dokumen berbahasa Indonesia
- Maximum file size: 10MB per dokumen

---

## 2. TECH STACK

### 2.1 Backend

#### Framework & Core
- **Python**: 3.10+
- **Framework**: FastAPI
  - Fast performance dengan async support
  - Auto-generated API documentation (Swagger/OpenAPI)
  - Built-in data validation dengan Pydantic
  - Easy integration dengan berbagai libraries

#### Database & ORM
- **Database**: MySQL 8.0+
- **ORM**: SQLAlchemy 2.0
- **Migration**: Alembic

#### Authentication & Security
- **JWT**: python-jose untuk token management
- **Password Hashing**: passlib dengan bcrypt
- **CORS**: fastapi-cors-middleware
- **Rate Limiting**: slowapi

#### OCR & Document Processing
- **OCR Engine**: Tesseract OCR 5.0+ / pytesseract
- **PDF Processing**: PyPDF2, pdfplumber
- **Word Processing**: python-docx
- **Image Processing**: Pillow (PIL)
- **Text Processing**: python-multipart untuk file uploads

#### Export & Reporting
- **Excel**: openpyxl, xlsxwriter
- **PDF**: ReportLab, WeasyPrint
- **Google Sheets**: gspread, google-api-python-client

#### Background Tasks & Caching
- **Task Queue**: Celery
- **Message Broker**: Redis
- **Caching**: Redis

#### Additional Libraries
- **Email**: python-email, smtplib
- **Validation**: pydantic, email-validator
- **Date/Time**: python-dateutil
- **Environment**: python-dotenv

### 2.2 Frontend

#### Framework & Core
- **JavaScript/TypeScript**: TypeScript untuk type safety
- **Framework**: React.js 18+
- **Build Tool**: Vite (fast build and HMR)
- **Routing**: React Router v6

#### UI Library & Styling
- **UI Components**: shadcn/ui
  - Accessible components
  - Customizable dengan Tailwind
  - Radix UI primitives
- **CSS Framework**: Tailwind CSS 3+
- **Icons**: Lucide React
- **Animations**: Framer Motion (optional)

#### State Management
- **Global State**: Zustand / Jotai
- **Server State**: TanStack Query (React Query)
  - Caching dan synchronization
  - Auto refetching
  - Optimistic updates

#### Form Handling
- **Form Library**: React Hook Form
- **Validation**: Zod schema validation
- **Integration**: @hookform/resolvers

#### Data Visualization
- **Charts**: Recharts
- **Alternative**: Chart.js dengan react-chartjs-2
- **Tables**: TanStack Table (React Table)

#### Additional Libraries
- **Date Picker**: react-day-picker
- **File Upload**: react-dropzone
- **PDF Viewer**: react-pdf
- **Toast Notifications**: sonner / react-hot-toast
- **HTTP Client**: Axios
- **Utilities**: date-fns, clsx, tailwind-merge

### 2.3 Database

#### RDBMS: MySQL 8.0+

**Tabel Utama:**
- `users` - Data pengguna sistem
- `surat_masuk` - Data surat masuk
- `surat_keluar` - Data surat keluar
- `kategori` - Master kategori surat
- `disposisi` - Data disposisi surat
- `notifikasi` - Notifikasi user
- `audit_logs` - Log aktivitas sistem
- `settings` - Konfigurasi sistem

**Optimasi:**
- Indexing pada kolom yang sering di-query
- Foreign key constraints
- Soft delete dengan kolom deleted_at
- Created/updated timestamps pada semua tabel

### 2.4 Export & Reporting Formats

#### Excel (.xlsx)
- **Library**: openpyxl / xlsxwriter
- **Features**:
  - Multiple sheets
  - Cell formatting dan styling
  - Auto-width columns
  - Header dengan logo kantor
  - Freeze panes
  - Data validation

#### PDF
- **Library**: ReportLab / WeasyPrint
- **Features**:
  - Custom page layout
  - Header/footer dengan logo
  - Table formatting
  - Page numbering
  - Digital signature placeholder

#### Google Sheets
- **Library**: gspread + google-api-python-client
- **Features**:
  - Direct export ke Google Sheets
  - Share link generation
  - Permission management
  - Auto-formatting

### 2.5 Infrastructure & DevOps

#### Containerization
- **Docker**: Container untuk aplikasi
- **Docker Compose**: Orchestration untuk development

#### File Storage
- **Local Storage**: Development dan small-scale
- **Cloud Storage**: AWS S3 / MinIO untuk production (scalable)
- **Structure**: Organized by year/month/type

#### Monitoring & Logging
- **Application Logging**: Python logging module
- **Error Tracking**: Sentry (optional)
- **Performance Monitoring**: FastAPI middleware

#### Deployment
- **Web Server**: Uvicorn (ASGI server)
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Platform**: VPS / Cloud (AWS, DigitalOcean, Azure)

---

## 3. FLOWCHART DAN ALUR KERJA APLIKASI

### 3.1 Alur Utama Sistem

```
START
  ↓
Login/Authentication
  ↓
Dashboard (Analytics & Overview)
  ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Surat Masuk    │  Surat Keluar   │  Perincian      │
│  - List         │  - List         │  - Archive      │
│  - Input/Upload │  - Input/Upload │  - Search       │
│  - Detail       │  - Detail       │  - Filter       │
│  - Disposisi    │  - Disposisi    │  - Export       │
└─────────────────┴─────────────────┴─────────────────┘
  ↓                   ↓                   ↓
Settings          Reports           Notifications
  ↓
Logout
  ↓
END
```

### 3.2 Flowchart Upload & Klasifikasi Otomatis

```
START: User Upload File
  ↓
Validasi File (format, size)
  ↓
[Valid?] ─NO→ Show Error Message → END
  ↓ YES
Upload ke Server (temporary)
  ↓
Deteksi Format File
  ↓
┌─────────────┬──────────────┬─────────────┐
│  PDF        │  Word/DOCX   │  Image      │
└─────────────┴──────────────┴─────────────┘
  ↓              ↓               ↓
Convert to Image (if needed)
  ↓
OCR Processing (Tesseract)
  ↓
Ekstraksi Teks
  ↓
Preprocessing Teks
  ↓
Keyword Matching & Classification
  ↓
Generate Confidence Score
  ↓
Auto-fill Form dengan hasil:
  - Kategori surat
  - Nomor surat (jika terdeteksi)
  - Tanggal surat (jika terdeteksi)
  - Pengirim (jika terdeteksi)
  - Keywords yang terdeteksi
  ↓
Tampilkan Preview & Hasil OCR
  ↓
User Review & Edit (if needed)
  ↓
User Confirm
  ↓
Simpan ke Database
  ↓
Pindahkan file ke permanent storage
  ↓
Generate Notification
  ↓
END
```

### 3.3 Flowchart Klasifikasi Rule-Based

```
START: Text dari OCR
  ↓
Normalisasi Teks:
  - Lowercase
  - Remove special characters
  - Tokenization
  ↓
Load Keyword Dictionary per Kategori:
  - Undangan: [undangan, hadir, acara, mengundang]
  - Pengumuman: [pengumuman, pemberitahuan, informasi]
  - Permohonan: [permohonan, mohon, mengajukan]
  - Laporan: [laporan, melaporkan, hasil]
  - Surat Tugas: [tugas, menugaskan, penugasan]
  - Edaran: [edaran, peredaran, surat edaran]
  ↓
Untuk setiap Kategori:
  ↓
  Hitung Score:
    - Exact match: +3 points
    - Partial match: +1 point
    - Position weight (jika di awal): +2 points
  ↓
Pilih Kategori dengan Score Tertinggi
  ↓
Hitung Confidence Score:
  - Confidence = (max_score / total_possible_score) × 100%
  ↓
[Confidence > 70%?]
  ↓ YES                    ↓ NO
Auto-assign Kategori    Set as "Perlu Review"
  ↓                        ↓
Return Result + Confidence Score
  ↓
END
```

### 3.4 Flowchart Disposisi Surat

```
START: User pilih surat untuk disposisi
  ↓
Buka Form Disposisi
  ↓
Input Data:
  - Tujuan disposisi (user/unit)
  - Catatan/instruksi
  - Priority
  - Deadline
  ↓
Submit Disposisi
  ↓
Simpan ke tabel disposisi
  ↓
Update status surat
  ↓
Kirim Notifikasi ke penerima:
  - In-app notification
  - Email notification (optional)
  ↓
Penerima terima notifikasi
  ↓
[Penerima buka surat?]
  ↓ YES
Update status: "Dibaca"
  ↓
[Penerima disposisi lanjut?] ─YES→ (kembali ke START)
  ↓ NO
[Penerima selesaikan?]
  ↓ YES
Update status: "Selesai"
  ↓
Notifikasi ke pemberi disposisi
  ↓
END
```

### 3.5 Flowchart Export Report

```
START: User klik Export
  ↓
Tampilkan Form Filter:
  - Date range
  - Jenis (masuk/keluar)
  - Kategori
  - Status
  - Prioritas
  ↓
User pilih Format Export:
  - Excel (.xlsx)
  - PDF
  - Google Sheets
  ↓
User pilih Template:
  - Laporan Ringkasan
  - Laporan Detail
  - Laporan per Kategori
  ↓
Generate Preview (optional)
  ↓
User Confirm Export
  ↓
Query Database dengan filter
  ↓
[Format?]
  ↓
┌─────────────┬──────────────┬─────────────────┐
│  Excel      │  PDF         │  Google Sheets  │
└─────────────┴──────────────┴─────────────────┘
  ↓              ↓               ↓
Generate File  Generate File   Create & Upload
  ↓              ↓               ↓
Download       Download        Get Share Link
  ↓              ↓               ↓
Log Activity (audit trail)
  ↓
Show Success Message
  ↓
END
```

### 3.6 Flowchart Notifikasi

```
TRIGGER EVENT:
  - Surat baru masuk
  - Disposisi baru
  - Deadline mendekati
  - Status berubah
  ↓
Create Notification Record
  ↓
Simpan ke tabel notifikasi
  ↓
┌────────────────┬────────────────┐
│  In-App        │  Email         │
└────────────────┴────────────────┘
  ↓                   ↓
Update badge count   Queue email job
Real-time push       Send via SMTP
  ↓                   ↓
User melihat notifikasi
  ↓
[User klik notifikasi?]
  ↓ YES
Mark as read
  ↓
Redirect ke halaman terkait
  ↓
END
```

---

## 4. RANCANGAN UI/UX

### 4.1 Prinsip Desain

#### Simplicity (Kesederhanaan)
- Interface yang bersih dan tidak overwhelm
- Fokus pada fungsi utama di setiap halaman
- Minimalisir step untuk menyelesaikan task

#### Consistency (Konsistensi)
- Consistent color scheme, typography, spacing
- Consistent button placement dan behavior
- Consistent terminology

#### Efficiency (Efisiensi)
- Quick actions untuk task yang sering dilakukan
- Keyboard shortcuts untuk power users
- Bulk actions untuk operasi massal

#### Accessibility (Aksesibilitas)
- WCAG 2.1 Level AA compliant
- Proper contrast ratio
- Keyboard navigation support
- Screen reader friendly

#### Responsive Design
- Desktop-first approach (primary use case)
- Tablet-friendly
- Mobile-responsive untuk viewing dan approval

### 4.2 Color Scheme

#### Primary Colors
```
Primary Blue: #3B82F6 (untuk buttons, links, active states)
Primary Dark: #1E40AF (hover states)
Primary Light: #DBEAFE (backgrounds, highlights)
```

#### Neutral Colors
```
Gray 900: #111827 (headings, primary text)
Gray 700: #374151 (body text)
Gray 500: #6B7280 (secondary text)
Gray 300: #D1D5DB (borders)
Gray 100: #F3F4F6 (backgrounds)
White: #FFFFFF
```

#### Status Colors
```
Success: #10B981 (completed, approved)
Warning: #F59E0B (pending, review needed)
Danger: #EF4444 (rejected, overdue)
Info: #3B82F6 (notifications, info)
```

#### Kategori Colors (untuk badges)
```
Undangan: #8B5CF6 (Purple)
Pengumuman: #EC4899 (Pink)
Permohonan: #F59E0B (Amber)
Laporan: #3B82F6 (Blue)
Surat Tugas: #10B981 (Green)
Edaran: #06B6D4 (Cyan)
Lain-lain: #6B7280 (Gray)
```

### 4.3 Typography

```
Font Family: Inter (Google Fonts)

Headings:
H1: 30px, Bold (Page titles)
H2: 24px, Semibold (Section titles)
H3: 20px, Semibold (Card titles)
H4: 18px, Medium (Form labels)

Body:
Body Large: 16px, Regular (main content)
Body: 14px, Regular (default)
Body Small: 12px, Regular (captions, helper text)

Line Height: 1.5 untuk readability
```

### 4.4 Layout Structure

#### Desktop Layout (1440px+)
```
┌─────────────────────────────────────────────────────┐
│  Top Bar (64px height)                              │
│  [Logo] [Search] [Notifications] [User Profile]    │
├─────────┬───────────────────────────────────────────┤
│         │                                           │
│ Sidebar │  Content Area                            │
│ (240px) │  (Dynamic)                               │
│         │                                           │
│ Menu:   │  - Breadcrumb                            │
│ ✓ Home  │  - Page Title                            │
│ □ Masuk │  - Filters/Actions                       │
│ □ Keluar│  - Main Content                          │
│ □ Arsip │  - Tables/Cards/Forms                    │
│ □ Report│                                           │
│ □ User  │                                           │
│ □ Config│                                           │
│         │                                           │
│ (280px) │  (1160px)                                │
└─────────┴───────────────────────────────────────────┘
```

#### Responsive Breakpoints
```
Desktop: 1440px+
Laptop: 1024px - 1439px
Tablet: 768px - 1023px
Mobile: < 768px
```

### 4.5 Component Library (shadcn/ui)

#### Navigation Components
- **Sidebar**: Collapsible sidebar dengan icons
- **Top Navigation**: Search, notifications, user menu
- **Breadcrumb**: Path navigation
- **Tabs**: Untuk switch antara views

#### Input Components
- **Input**: Text, number, email fields
- **Textarea**: Multi-line text
- **Select**: Dropdown selection
- **Combobox**: Searchable dropdown
- **Date Picker**: Calendar selection
- **File Upload**: Drag & drop area
- **Radio Group**: Single selection
- **Checkbox**: Multiple selection
- **Switch**: Toggle on/off

#### Display Components
- **Table**: Data tables dengan sorting, filtering
- **Card**: Container untuk content grouping
- **Badge**: Status indicators, categories
- **Avatar**: User profile pictures
- **Skeleton**: Loading states

#### Feedback Components
- **Alert**: Important messages
- **Toast**: Temporary notifications
- **Dialog/Modal**: Confirmation, forms
- **Tooltip**: Helpful hints
- **Progress**: Loading indicators

#### Action Components
- **Button**: Primary, secondary, ghost variants
- **Dropdown Menu**: Context menus
- **Sheet**: Side panel untuk details
- **Command**: Command palette (Cmd+K)

### 4.6 Interaction Patterns

#### Hover States
- Button: Scale 1.02, shadow increase
- Card: Shadow elevation, border color change
- Table row: Background color change

#### Loading States
- Skeleton loaders untuk content
- Spinner untuk buttons
- Progress bar untuk file uploads

#### Empty States
- Ilustrasi + helpful text
- Call-to-action button
- Sugesti next steps

#### Error States
- Clear error messages
- Suggestion untuk fix
- Contact support option

---

## 5. HALAMAN-HALAMAN

### 5.1 Login & Authentication

#### 5.1.1 Halaman Login (`/login`)

**Layout:**
- Split screen design
- Left: Ilustrasi/branding (40%)
- Right: Login form (60%)

**Form Elements:**
```
┌────────────────────────────┐
│  Logo Instansi             │
│  -------------------------  │
│  Username/Email            │
│  [input field]             │
│                            │
│  Password                  │
│  [input field] [eye icon]  │
│                            │
│  □ Remember me             │
│                            │
│  [Login Button]            │
│                            │
│  Forgot Password? →        │
└────────────────────────────┘
```

**Features:**
- Input validation real-time
- Password show/hide toggle
- Remember me (save to localStorage)
- Loading state saat submit
- Error message display
- Rate limiting protection

**Validasi:**
- Username/Email: Required, format validation
- Password: Required, min 6 characters
- Show clear error messages

**Security:**
- JWT token generation
- Secure HTTP-only cookies (optional)
- Failed login attempt tracking
- Account lockout setelah 5x gagal (15 menit)

#### 5.1.2 Forgot Password (Optional untuk MVP)
- Email verification
- Reset token generation
- Password reset form

---

### 5.2 Dashboard / Halaman Depan (`/dashboard`)

#### 5.2.1 Layout Overview

**Header Section:**
```
Welcome back, [Nama User]!
[Current Date & Time]
```

**Statistics Cards (4 cards):**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Surat Masuk │Surat Keluar │   Pending   │  Selesai    │
│   Bulan Ini │  Bulan Ini  │Klasifikasi  │  Hari Ini   │
│             │             │             │             │
│    156      │     89      │     12      │     43      │
│  (+12%)     │  (+8%)      │  (-5%)      │  (+15%)     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Charts Section:**
```
┌─────────────────────────────────────┬─────────────────┐
│                                     │                 │
│  Line Chart: Trend Surat            │  Pie Chart:     │
│  (6 bulan terakhir)                 │  Kategori       │
│  - Surat Masuk (blue line)          │  Surat          │
│  - Surat Keluar (green line)        │                 │
│                                     │  □ Undangan     │
│                                     │  □ Pengumuman   │
│                                     │  □ Permohonan   │
│                                     │  □ Lainnya      │
└─────────────────────────────────────┴─────────────────┘
```

**Recent Activities (Timeline):**
```
┌───────────────────────────────────────────────────────┐
│  Aktivitas Terbaru                         [View All] │
├───────────────────────────────────────────────────────┤
│  ● [User] menambahkan surat masuk #123  - 2 min ago  │
│  ● [User] disposisi surat keluar #456   - 15 min ago │
│  ● [User] export laporan bulan Jan     - 1 hour ago  │
│  ● [User] mengupdate kategori          - 2 hours ago │
└───────────────────────────────────────────────────────┘
```

**Quick Actions (Floating Action Buttons):**
```
[+ Surat Masuk]  [+ Surat Keluar]  [📊 Export]
```

#### 5.2.2 Analytics Details

**Surat Masuk Card:**
- Total surat masuk bulan ini
- Persentase perubahan vs bulan lalu
- Icon indicator (up/down)
- Click untuk go to Surat Masuk page

**Surat Keluar Card:**
- Total surat keluar bulan ini
- Persentase perubahan vs bulan lalu
- Icon indicator
- Click untuk go to Surat Keluar page

**Pending Klasifikasi Card:**
- Jumlah surat yang perlu review
- Status: Warning (if > 10)
- Click untuk filter "Perlu Review"

**Selesai Hari Ini Card:**
- Disposisi selesai hari ini
- Status: Success
- Motivational indicator

**Line Chart:**
- X-axis: 6 bulan terakhir
- Y-axis: Jumlah surat
- Interactive hover tooltips
- Legend toggle
- Zoom capability

**Pie Chart:**
- Distribusi kategori surat
- Interactive segments
- Hover untuk persentase
- Click untuk filter by kategori

**Bar Chart (Additional):**
- Top 5 pengirim surat masuk
- Response time average

---

### 5.3 Surat Masuk (`/surat-masuk`)

#### 5.3.1 List View (Table)

**Page Header:**
```
Surat Masuk                                    [+ Tambah Surat Masuk]
```

**Filter & Search Section:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [Search: nomor, pengirim, perihal...]                    │
├──────────────┬──────────────┬──────────────┬───────────────┤
│ [Tanggal: ▼] │ [Kategori:▼] │ [Status: ▼]  │ [Priority:▼] │
└──────────────┴──────────────┴──────────────┴───────────────┘
[Reset Filter]  [Export]  [Bulk Actions ▼]
```

**Table:**
```
┌────┬────────┬────────────┬──────────┬─────────┬─────────┬────────┬──────┐
│ □  │ No     │ Tgl Surat  │ Pengirim │ Perihal │ Kategori│ Status │ Aksi │
├────┼────────┼────────────┼──────────┼─────────┼─────────┼────────┼──────┤
│ □  │ 001/SM │ 08/02/2026 │ Dinas A  │ Undang..│[Badge]  │ [Badge]│ •••  │
│ □  │ 002/SM │ 07/02/2026 │ Dinas B  │ Permoh..│[Badge]  │ [Badge]│ •••  │
└────┴────────┴────────────┴──────────┴─────────┴─────────┴────────┴──────┘

[< Previous]  Page 1 of 10  [Next >]
```

**Table Features:**
- Checkbox untuk bulk selection
- Sortable columns (click header)
- Responsive row height
- Hover effect untuk rows
- Colored badges untuk kategori & status
- Action dropdown (•••):
  - 👁️ View Detail
  - ✏️ Edit
  - 📤 Disposisi
  - 📎 Download File
  - 🗑️ Delete
  - 📋 Duplicate

**Kolom Table:**
1. **Checkbox**: Bulk selection
2. **Nomor Surat**: Clickable link ke detail
3. **Tanggal Surat**: Format: DD/MM/YYYY
4. **Pengirim**: Nama instansi/person
5. **Perihal**: Truncated text (max 50 chars) dengan tooltip
6. **Kategori**: Badge dengan color coding
7. **Status**: Badge (Baru, Proses, Selesai, Archived)
8. **Priority** (optional column): Badge (Rendah, Sedang, Tinggi, Urgent)
9. **Aksi**: Dropdown menu

**Status Badge Colors:**
- Baru: Blue
- Proses: Yellow
- Selesai: Green
- Archived: Gray

**Filter Options:**

*Tanggal:*
- Hari ini
- 7 hari terakhir
- 30 hari terakhir
- Bulan ini
- Bulan lalu
- Custom range (date picker)

*Kategori:*
- Semua
- Undangan
- Pengumuman
- Permohonan
- Laporan
- Surat Tugas
- Edaran
- Lain-lain

*Status:*
- Semua
- Baru
- Proses
- Selesai
- Archived

*Priority:*
- Semua
- Rendah
- Sedang
- Tinggi
- Urgent

**Bulk Actions:**
- Export selected
- Update kategori
- Update status
- Delete selected (soft delete)
- Archive selected

**Pagination:**
- Items per page: 10, 25, 50, 100
- Page navigation
- Jump to page input
- Total items display

#### 5.3.2 Detail View (Modal/Sheet)

**Layout:**
```
┌────────────────────────────────────────────────────┐
│  Surat Masuk - Detail                         [✕]  │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Left Panel - 60%]        [Right Panel - 40%]    │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │                  │      │  Info Surat      │   │
│  │  File Preview    │      │  ───────────────  │   │
│  │  (PDF/Image)     │      │  No: 001/SM/2026 │   │
│  │                  │      │  Tgl: 08/02/2026 │   │
│  │  [Zoom Controls] │      │  Dari: Dinas A   │   │
│  │  [Download]      │      │  Kategori: 📧    │   │
│  │                  │      │  Status: Proses  │   │
│  │                  │      │  Priority: Tinggi│   │
│  │                  │      │                  │   │
│  │                  │      │  Perihal:        │   │
│  │                  │      │  [Full text...]  │   │
│  │                  │      │                  │   │
│  │                  │      │  Deskripsi:      │   │
│  │                  │      │  [Full text...]  │   │
│  │                  │      │                  │   │
│  │                  │      │  OCR Result:     │   │
│  │                  │      │  Confidence: 85% │   │
│  │                  │      │  Keywords: [...] │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  Riwayat Disposisi                           │ │
│  │  ─────────────────────────────────────────── │ │
│  │  ● [User A] → [User B]: "Mohon ditindak.."  │ │
│  │    Status: Selesai | 07/02/2026 10:30       │ │
│  │  ● [User B] → [User C]: "Untuk diperiksa.." │ │
│  │    Status: Proses | 08/02/2026 09:15        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Edit] [Disposisi] [Download] [Archive] [Delete] │
└────────────────────────────────────────────────────┘
```

**Features:**
- Split panel layout
- PDF/Image viewer dengan zoom
- Full metadata display
- OCR result visualization
- Disposisi timeline
- Action buttons

**File Preview:**
- PDF: Embedded PDF viewer
- Image: Zoomable image viewer
- Word: Convert to PDF first
- Navigation untuk multi-page documents

---

### 5.4 Surat Keluar (`/surat-keluar`)

#### Struktur & Features

Surat Keluar memiliki struktur yang sama dengan Surat Masuk dengan beberapa perbedaan:

**Perbedaan Utama:**

1. **Kolom Table berbeda:**
   - "Pengirim" → "Tujuan/Penerima"
   - Tambahan kolom: "Nomor Surat Keluar" (auto-generated)

2. **Form Input berbeda:**
   - Penerima (bukan Pengirim)
   - Tembusan (CC)
   - Lampiran references

3. **Penomoran Otomatis:**
   - Format: `XXX/SK/UNIT/BULAN/TAHUN`
   - Auto-increment berdasarkan bulan
   - Customizable format di Settings

4. **Template Surat (Optional):**
   - Pre-defined templates
   - Mail merge capability

**Table Surat Keluar:**
```
┌────┬────────┬────────────┬──────────┬─────────┬─────────┬────────┬──────┐
│ □  │ No SK  │ Tgl Surat  │ Tujuan   │ Perihal │ Kategori│ Status │ Aksi │
├────┼────────┼────────────┼──────────┼─────────┼─────────┼────────┼──────┤
│ □  │ 001/SK │ 08/02/2026 │ Dinas A  │ Undang..│[Badge]  │ [Badge]│ •••  │
└────┴────────┴────────────┴──────────┴─────────┴─────────┴────────┴──────┘
```

Seluruh fitur lainnya (filter, search, bulk actions, detail view) sama dengan Surat Masuk.

---

### 5.5 Input Data Surat (`/surat-masuk/tambah` atau `/surat-keluar/tambah`)

#### 5.5.1 Metode 1: Input Manual

**Form Layout:**
```
┌────────────────────────────────────────────────────────┐
│  Tambah Surat Masuk Baru                          [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Metode Input:                                         │
│  ○ Manual Input     ● Upload & Scan                    │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Nomor Surat *                                         │
│  [_____________________]                               │
│                                                        │
│  Tanggal Surat *                                       │
│  [📅 DD/MM/YYYY]                                       │
│                                                        │
│  Pengirim/Penerima *                                   │
│  [_____________________]                               │
│                                                        │
│  Perihal/Subjek *                                      │
│  [_____________________]                               │
│                                                        │
│  Kategori Surat *                                      │
│  [Pilih Kategori... ▼]                                 │
│                                                        │
│  Prioritas                                             │
│  [Pilih Prioritas... ▼]                                │
│                                                        │
│  Deskripsi/Isi Singkat                                 │
│  [                                                 ]   │
│  [                                                 ]   │
│  [                                                 ]   │
│                                                        │
│  Upload File Lampiran (Optional)                       │
│  ┌─────────────────────────────────────────────┐      │
│  │  📎 Drag & drop file atau klik untuk browse │      │
│  │     PDF, DOC, DOCX, JPG, PNG (Max 10MB)     │      │
│  └─────────────────────────────────────────────┘      │
│                                                        │
│  Tags/Keywords (Optional)                              │
│  [________________] [+ Add Tag]                        │
│  [Tag 1 ✕] [Tag 2 ✕]                                  │
│                                                        │
│                      [Batal]  [Simpan sebagai Draft]  │
│                                        [Simpan]       │
└────────────────────────────────────────────────────────┘
```

**Field Specifications:**

1. **Nomor Surat** (Required)
   - Input: Text
   - Validation: Unique check
   - Format suggestion shown

2. **Tanggal Surat** (Required)
   - Input: Date picker
   - Default: Today
   - Can select past/future dates

3. **Pengirim/Penerima** (Required)
   - Input: Text with autocomplete
   - Suggestion dari data sebelumnya

4. **Perihal/Subjek** (Required)
   - Input: Text
   - Max 200 characters
   - Character counter

5. **Kategori** (Required)
   - Input: Dropdown select
   - Options dari master kategori
   - Can add new (admin only)

6. **Prioritas** (Optional)
   - Input: Select
   - Options: Rendah, Sedang, Tinggi, Urgent
   - Default: Sedang

7. **Deskripsi** (Optional)
   - Input: Textarea
   - Max 1000 characters
   - Rich text editor (optional)

8. **File Upload** (Optional)
   - Drag & drop zone
   - File browser
   - Preview uploaded file
   - Multiple files support
   - Progress bar saat upload

9. **Tags** (Optional)
   - Input: Tag input
   - Suggestions dari existing tags
   - Free text entry

**Validation:**
- Real-time validation
- Required field indicators (*)
- Error messages below fields
- Prevent submit jika ada error

**Actions:**
- **Batal**: Konfirmasi discard changes
- **Simpan sebagai Draft**: Save incomplete form
- **Simpan**: Validate & save to DB

#### 5.5.2 Metode 2: Upload & Scan (OCR)

**Step 1: Upload File**
```
┌────────────────────────────────────────────────────────┐
│  Tambah Surat dengan Upload & Scan                [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Metode Input:                                         │
│  ○ Manual Input     ● Upload & Scan                    │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Step 1: Upload File Surat                             │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │           📄                                     │ │
│  │                                                  │ │
│  │     Drag & drop file surat di sini               │ │
│  │     atau klik untuk browse                       │ │
│  │                                                  │ │
│  │     Supported: PDF, DOC, DOCX, JPG, PNG         │ │
│  │     Max size: 10MB                               │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│                                          [Next Step >] │
└────────────────────────────────────────────────────────┘
```

**Step 2: OCR Processing**
```
┌────────────────────────────────────────────────────────┐
│  Processing...                                    [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Step 2: Ekstraksi Data dengan OCR                     │
│                                                        │
│  📄 File: surat_dinas_001.pdf                          │
│                                                        │
│  [████████████████████░░░░] 80%                        │
│                                                        │
│  ✓ File uploaded                                       │
│  ✓ Converting to image...                              │
│  ⏳ OCR processing...                                  │
│  ⏱️ Analyzing text...                                  │
│  ⏱️ Classifying document...                            │
│                                                        │
│  Estimated time: 15 seconds                            │
│                                                        │
│                                            [Cancel]    │
└────────────────────────────────────────────────────────┘
```

**Step 3: Review & Edit Hasil OCR**
```
┌────────────────────────────────────────────────────────┐
│  Review Hasil OCR                                 [✕]  │
├─────────────────────────┬──────────────────────────────┤
│                         │                              │
│  [Preview File]         │  Hasil Ekstraksi:            │
│  ┌───────────────────┐  │                              │
│  │                   │  │  ✓ Nomor Surat (98%)         │
│  │   [Document]      │  │  001/SK/DIN/II/2026          │
│  │   [Preview]       │  │  [Edit ✏️]                   │
│  │                   │  │                              │
│  │                   │  │  ✓ Tanggal (95%)             │
│  │                   │  │  08 Februari 2026            │
│  │                   │  │  [Edit ✏️]                   │
│  └───────────────────┘  │                              │
│                         │  ✓ Pengirim (92%)            │
│  OCR Text:              │  Dinas Pendidikan Kota       │
│  ┌───────────────────┐  │  [Edit ✏️]                   │
│  │ PEMERINTAH KOTA   │  │                              │
│  │ DINAS PENDIDIKAN  │  │  ⚠️ Perihal (65%)           │
│  │                   │  │  Undangan Rapat Koordinasi   │
│  │ Nomor: 001/SK/... │  │  [Edit ✏️]                   │
│  │ Tanggal: 8 Feb... │  │                              │
│  │ ...               │  │  ✓ Kategori (85%)            │
│  └───────────────────┘  │  📧 Undangan                 │
│                         │  [Change ▼]                  │
│  [Download OCR Text]    │                              │
│                         │  Keywords Detected:          │
│                         │  [undangan] [rapat] [hadir]  │
│                         │                              │
│                         │  Confidence Score: 87%       │
│                         │  ⭐⭐⭐⭐☆                    │
└─────────────────────────┴──────────────────────────────┘
│  < Back                    [Review Form]  [Auto-Fill] │
└────────────────────────────────────────────────────────┘
```

**Features OCR Result:**

1. **Confidence Indicators**
   - High (>80%): Green check ✓
   - Medium (60-80%): Warning ⚠️
   - Low (<60%): Error ✗
   - Percentage shown

2. **Editable Fields**
   - Inline edit capability
   - Quick edit button
   - Validation on edit

3. **Preview Panel**
   - Original document preview
   - Highlight detected regions (optional)
   - Zoom controls

4. **OCR Text Display**
   - Raw extracted text
   - Copy/download option
   - Useful untuk verification

5. **Auto-Classification Result**
   - Detected category
   - Confidence score
   - Change dropdown
   - Keywords yang mempengaruhi

6. **Action Options**
   - **Auto-Fill**: Auto-fill form dengan hasil OCR
   - **Review Form**: Manual review semua fields
   - **Back**: Kembali upload file lain

**Step 4: Final Form Review**
- Same as Manual Input form
- Pre-filled dengan hasil OCR
- User dapat edit semua fields
- Save atau Submit

**Error Handling:**

*Upload Error:*
- File too large
- Invalid format
- Corrupted file
- Network error

*OCR Error:*
- Unable to extract text
- Low quality image
- Unsupported language
- Processing timeout

→ Fallback to manual input

---

### 5.6 Klasifikasi Otomatis (Background Process)

#### 5.6.1 Tidak Ada Halaman Khusus

Klasifikasi otomatis berjalan di background setelah:
- File uploaded (metode 2)
- Text extracted via OCR

**Process Flow:**
1. Text preprocessing
2. Keyword matching per kategori
3. Score calculation
4. Kategori selection
5. Confidence score generation

#### 5.6.2 Settings untuk Klasifikasi (`/settings/classification`)

**Page Layout:**
```
┌────────────────────────────────────────────────────────┐
│  Pengaturan Klasifikasi Otomatis                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Confidence Threshold                                  │
│  ─────────────────                                     │
│  Minimum confidence untuk auto-assign kategori:        │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] 70%          │
│  (Jika di bawah threshold, akan ditandai "Perlu       │
│   Review")                                             │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Master Kategori & Keywords                            │
│  ───────────────────────                               │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📧 Undangan                    [Edit] [Delete]    │ │
│  │ Keywords: undangan, hadir, menghadiri, acara,    │ │
│  │           pertemuan, rapat                        │ │
│  │ Score Weight: 3 (exact match), 1 (partial)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📢 Pengumuman                  [Edit] [Delete]    │ │
│  │ Keywords: pengumuman, pemberitahuan, informasi,  │ │
│  │           diumumkan, memberitahukan               │ │
│  │ Score Weight: 3 (exact match), 1 (partial)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📝 Permohonan                  [Edit] [Delete]    │ │
│  │ Keywords: permohonan, mohon, mengajukan,         │ │
│  │           permohonan izin, memohon                │ │
│  │ Score Weight: 3 (exact match), 1 (partial)       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [+ Tambah Kategori Baru]                              │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Advanced Settings                                     │
│  ─────────────────                                     │
│  ☑ Consider position weight (keywords di awal dokumen │
│     lebih tinggi scorenya)                             │
│  ☑ Case-insensitive matching                          │
│  ☑ Remove stop words sebelum matching                 │
│  ☐ Enable fuzzy matching (typo tolerance)             │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  [Test Klasifikasi]  [Reset to Default]  [Save]       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Features:**

1. **Threshold Slider**
   - Visual slider 0-100%
   - Default: 70%
   - Real-time update

2. **Kategori Management**
   - CRUD operations
   - Keyword editing
   - Color picker untuk badge
   - Reorder categories

3. **Keyword Editor Modal:**
```
┌────────────────────────────────┐
│  Edit Kategori: Undangan  [✕] │
├────────────────────────────────┤
│  Nama Kategori:                │
│  [Undangan______________]      │
│                                │
│  Warna Badge:                  │
│  [🎨] #8B5CF6 (Purple)         │
│                                │
│  Keywords (pisahkan dengan ,): │
│  [undangan, hadir, acara,   ]  │
│  [menghadiri, pertemuan,    ]  │
│  [rapat                     ]  │
│                                │
│  Scoring:                      │
│  Exact match: [3▼] points      │
│  Partial match: [1▼] points    │
│  Position bonus: [2▼] points   │
│                                │
│          [Cancel]  [Save]      │
└────────────────────────────────┘
```

4. **Test Klasifikasi Tool:**
```
┌────────────────────────────────┐
│  Test Klasifikasi         [✕] │
├────────────────────────────────┤
│  Paste text untuk test:        │
│  [                          ]  │
│  [                          ]  │
│  [                          ]  │
│                                │
│  [Classify]                    │
│                                │
│  Hasil:                        │
│  ┌──────────────────────────┐  │
│  │ Kategori: Undangan       │  │
│  │ Confidence: 85%          │  │
│  │ Matched Keywords:        │  │
│  │ - undangan (exact)       │  │
│  │ - hadir (exact)          │  │
│  │ - acara (partial)        │  │
│  │ Score: 9/12              │  │
│  └──────────────────────────┘  │
│                                │
│          [Close]               │
└────────────────────────────────┘
```

---

### 5.7 Perincian Arsip (`/arsip`)

**Page Purpose:** Advanced search, filtering, dan bulk operations untuk semua surat (masuk + keluar)

#### 5.7.1 Layout

**Header:**
```
Perincian & Arsip Surat
```

**Advanced Filter Panel (Collapsible):**
```
┌────────────────────────────────────────────────────────┐
│  🔍 Pencarian Lanjutan                    [▼ Collapse] │
├────────────────────────────────────────────────────────┤
│  Jenis Surat:     Periode:                Kategori:    │
│  [○ Semua     ]   [📅 Custom Range]       [Pilih..▼]   │
│  [○ Masuk     ]   From: [DD/MM/YYYY]                   │
│  [○ Keluar    ]   To:   [DD/MM/YYYY]      Status:      │
│                                           [Pilih..▼]   │
│  Pengirim/Tujuan:        Prioritas:                    │
│  [_____________]          [Pilih..▼]       Tags:       │
│                                           [_______]    │
│  Full Text Search:                                     │
│  [____________________________________]   [Search]     │
│                                                        │
│  [Reset Filter]  [Save Search Query]  [Load Saved]    │
└────────────────────────────────────────────────────────┘
```

**Results Section:**
```
┌────────────────────────────────────────────────────────┐
│  📊 Hasil: 245 surat ditemukan          [View: ▼]     │
│  [Export Selected]  [Bulk Update]  [Archive Selected] │
├────────────────────────────────────────────────────────┤
│  ┌──┬─────┬────────┬────────┬─────────┬────────┬───┐  │
│  │□ │Jenis│No Surat│Tanggal │Perihal  │Kategori│•••│  │
│  ├──┼─────┼────────┼────────┼─────────┼────────┼───┤  │
│  │□ │ Masuk│001/SM │08/02/26│Undang.. │[Badge] │•••│  │
│  │□ │Keluar│001/SK │07/02/26│Laporan..│[Badge] │•••│  │
│  │□ │ Masuk│002/SM │06/02/26│Permoh.. │[Badge] │•••│  │
│  └──┴─────┴────────┴────────┴─────────┴────────┴───┘  │
│                                                        │
│  [Select All]  [Deselect All]                          │
│  [< Prev]  Page 1 of 25  [Next >]  [50 per page ▼]    │
└────────────────────────────────────────────────────────┘
```

**Archive Management Section:**
```
┌────────────────────────────────────────────────────────┐
│  🗄️ Arsip (Soft Deleted Items)          [Show/Hide]   │
├────────────────────────────────────────────────────────┤
│  Note: Items will be permanently deleted after 30 days │
│                                                        │
│  ┌──┬────────┬────────┬─────────┬──────────┬──────┐   │
│  │□ │No Surat│Tanggal │Kategori │Deleted At│Action│   │
│  ├──┼────────┼────────┼─────────┼──────────┼──────┤   │
│  │□ │001/SM  │05/02/26│Undangan │09/02/26  │Restore│  │
│  │□ │002/SK  │04/02/26│Laporan  │08/02/26  │Restore│  │
│  └──┴────────┴────────┴─────────┴──────────┴──────┘   │
│                                                        │
│  [Restore Selected]  [Delete Permanently]              │
└────────────────────────────────────────────────────────┘
```

#### 5.7.2 Features Detail

**Advanced Search:**
- Full-text search di semua fields
- Search in OCR extracted text
- Search by tags
- Regex support (optional)

**Saved Search Queries:**
- Save frequently used filters
- Quick load saved searches
- Share search queries dengan users lain

**Bulk Operations:**
1. **Bulk Export**
   - Export selected items
   - Choose format (XLSX/PDF)

2. **Bulk Update**
   - Update kategori
   - Update status
   - Update tags
   - Assign disposisi

3. **Bulk Archive**
   - Soft delete selected
   - Move to archive

4. **Bulk Restore**
   - Restore dari archive
   - Bulk permanent delete (admin only)

**View Options:**
- Table view (default)
- Grid view (cards)
- List view (detailed)

**Export Options:**
- Export current filtered results
- Export selected only
- Export all data (with confirmation)

---

### 5.8 Export Reports (`/reports`)

#### 5.8.1 Page Layout

**Header:**
```
Laporan & Export Data
```

**Export Configuration:**
```
┌────────────────────────────────────────────────────────┐
│  📊 Konfigurasi Laporan                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Step 1: Filter Data                                   │
│  ───────────────────                                   │
│  Periode Laporan: *                                    │
│  [📅 01/01/2026] sampai [📅 09/02/2026]               │
│                                                        │
│  Jenis Surat:                                          │
│  ☑ Surat Masuk    ☑ Surat Keluar                      │
│                                                        │
│  Kategori:                                             │
│  [Pilih kategori... ▼] atau [☑ Semua Kategori]        │
│                                                        │
│  Status:                                               │
│  ☑ Baru  ☑ Proses  ☑ Selesai  ☐ Archived             │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Step 2: Pilih Template Laporan                        │
│  ───────────────────────────────                       │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │ 📄 Ringkasan    │  │ 📋 Detail       │            │
│  │                 │  │                 │            │
│  │ • Total surat   │  │ • Full info     │            │
│  │ • By kategori   │  │ • All fields    │            │
│  │ • Charts        │  │ • Disposisi     │            │
│  │                 │  │ • Attachments   │            │
│  │   [Select]      │  │   [Select]      │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                        │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │ 📊 Per Kategori │  │ ⚡ Custom       │            │
│  │                 │  │                 │            │
│  │ • Group by cat  │  │ • Choose fields │            │
│  │ • Stats per cat │  │ • Custom layout │            │
│  │ • Comparison    │  │ • Advanced      │            │
│  │                 │  │                 │            │
│  │   [Select]      │  │   [Select]      │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Step 3: Format Export                                 │
│  ──────────────────                                    │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐       │
│  │    📗    │  │    📕    │  │      📊       │       │
│  │   XLSX   │  │   PDF    │  │ Google Sheets │       │
│  │ [Select] │  │ [Select] │  │   [Select]    │       │
│  └──────────┘  └──────────┘  └───────────────┘       │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Preview (Optional)                                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │  [Preview thumbnail atau table preview]          │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Reset]  [Preview Full]  [Generate & Download]       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.8.2 Template Details

**1. Laporan Ringkasan (Summary Report)**

*Excel Format:*
```
Sheet 1: Overview
- Header: Logo, Nama Instansi, Periode
- Summary Statistics:
  ┌────────────────────┬───────┐
  │ Total Surat Masuk  │  245  │
  │ Total Surat Keluar │  189  │
  │ Total Disposisi    │  312  │
  │ Avg Response Time  │ 2 hari│
  └────────────────────┴───────┘

Sheet 2: By Kategori
  ┌──────────────┬───────┬────────┬─────────┐
  │ Kategori     │ Masuk │ Keluar │ Total   │
  ├──────────────┼───────┼────────┼─────────┤
  │ Undangan     │  45   │  23    │   68    │
  │ Pengumuman   │  67   │  45    │  112    │
  └──────────────┴───────┴────────┴─────────┘

Sheet 3: Charts
  - Pie chart image
  - Bar chart image
  - Trend line chart

Sheet 4: Timeline
  - Monthly breakdown
  - Comparison dengan periode sebelumnya
```

*PDF Format:*
```
Page 1: Cover
  - Logo
  - Judul Laporan
  - Periode
  - Generated date
  - Signature placeholder

Page 2-3: Executive Summary
  - Key metrics
  - Charts embedded
  - Highlights

Page 4-N: Detailed Statistics
  - Tables dengan styling
  - Footer: page number, date
```

**2. Laporan Detail (Detailed Report)**

*Excel Format:*
```
Sheet 1: Surat Masuk
  ┌───┬───────┬────────┬─────────┬─────────┬─────────┬────────┬─────────┐
  │No │No Surat│Tanggal│Pengirim │Perihal  │Kategori │Status  │Disposisi│
  ├───┼───────┼────────┼─────────┼─────────┼─────────┼────────┼─────────┤
  │ 1 │001/SM │08/02/26│Dinas A  │Undang.. │Undangan │Selesai │User A   │
  │ 2 │002/SM │07/02/26│Dinas B  │Permoh.. │Permohon │Proses  │User B   │
  └───┴───────┴────────┴─────────┴─────────┴─────────┴────────┴─────────┘

Sheet 2: Surat Keluar
  - Similar structure

Sheet 3: Disposisi Log
  - Full disposisi history

Sheet 4: Statistics
  - Auto-calculated stats
```

**3. Laporan Per Kategori**

*Grouped by kategori:*
```
Kategori: Undangan
├── Total: 68 surat
├── Masuk: 45 surat
├── Keluar: 23 surat
├── Avg Response: 1.5 hari
└── Top Senders: [...]

Kategori: Pengumuman
└── [similar structure]
```

**4. Custom Report**

*User bisa pilih:*
- Columns to include
- Sort order
- Grouping
- Calculated fields
- Custom formulas

#### 5.8.3 Export Process

**Progress Modal:**
```
┌────────────────────────────────┐
│  Generating Report...     [✕] │
├────────────────────────────────┤
│                                │
│  [████████████░░░░░] 65%       │
│                                │
│  ✓ Querying database           │
│  ✓ Processing 245 records      │
│  ⏳ Generating Excel file...   │
│  ⏱️ Creating charts...         │
│                                │
│  Estimated time: 10 seconds    │
│                                │
│          [Cancel]              │
└────────────────────────────────┘
```

**Success Modal:**
```
┌────────────────────────────────┐
│  ✓ Report Generated!      [✕] │
├────────────────────────────────┤
│                                │
│  📄 Laporan_2026-02-09.xlsx    │
│  Size: 2.5 MB                  │
│  Records: 245 surat            │
│                                │
│  [Download]  [Open in Excel]   │
│                                │
│  Share via:                    │
│  [📧 Email]  [💾 Save to Cloud]│
│                                │
└────────────────────────────────┘
```

#### 5.8.4 Google Sheets Export

**Flow:**
1. User pilih Google Sheets
2. OAuth authentication (jika belum)
3. Create new spreadsheet
4. Upload data
5. Format spreadsheet
6. Set permissions
7. Return share link

**Success:**
```
┌────────────────────────────────┐
│  ✓ Exported to Google Sheets!│
├────────────────────────────────┤
│                                │
│  📊 Laporan 2026-02-09         │
│                                │
│  [Open in Google Sheets]       │
│                                │
│  Share Link:                   │
│  https://docs.google.com/...   │
│  [Copy Link]                   │
│                                │
│  Permissions:                  │
│  ○ Anyone with link can view   │
│  ○ Anyone with link can edit   │
│  ● Only me                     │
│                                │
│          [Done]                │
└────────────────────────────────┘
```

#### 5.8.5 Scheduled Reports (Future Enhancement)

```
┌────────────────────────────────┐
│  Schedule Automatic Report    │
├────────────────────────────────┤
│  Frequency:                    │
│  ○ Daily                       │
│  ● Weekly (every Monday)       │
│  ○ Monthly (first day)         │
│                                │
│  Email to:                     │
│  [admin@example.com_____]      │
│                                │
│  Format: [XLSX ▼]              │
│  Template: [Ringkasan ▼]       │
│                                │
│  [Cancel]  [Schedule]          │
└────────────────────────────────┘
```

---

### 5.9 Settings / Pengaturan (`/settings`)

#### 5.9.1 Settings Menu (Tabs)

```
┌────────────────────────────────────────────────────────┐
│  ⚙️ Pengaturan Sistem                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Profile]  [Users]  [Kategori]  [Klasifikasi]        │
│  [System]  [Backup]  [Notifications]  [Audit Log]     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.9.2 Profile Management (`/settings/profile`)

```
┌────────────────────────────────────────────────────────┐
│  👤 Profile Management                                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────┐                                        │
│  │            │  [Upload Photo]  [Remove]              │
│  │   Avatar   │                                        │
│  │            │                                        │
│  └────────────┘                                        │
│                                                        │
│  Nama Lengkap: *                                       │
│  [John Doe_________________]                           │
│                                                        │
│  Username: *                                           │
│  [johndoe__________________]                           │
│                                                        │
│  Email: *                                              │
│  [john@example.com_________]                           │
│                                                        │
│  Role:                                                 │
│  [Admin] (read-only)                                   │
│                                                        │
│  Unit/Bagian:                                          │
│  [Bagian Umum______________]                           │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Ubah Password                                         │
│  ─────────────                                         │
│  Password Lama:                                        │
│  [____________] 👁️                                    │
│                                                        │
│  Password Baru:                                        │
│  [____________] 👁️                                    │
│                                                        │
│  Konfirmasi Password:                                  │
│  [____________] 👁️                                    │
│                                                        │
│  [Update Password]                                     │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  [Cancel]  [Save Changes]                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.9.3 User Management (`/settings/users`) - Admin Only

```
┌────────────────────────────────────────────────────────┐
│  👥 User Management                    [+ Add User]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔍 [Search users...]                  [Filter: All▼] │
│                                                        │
│  ┌──┬──────────┬──────────────┬─────────┬────────┬──┐ │
│  │□ │Username  │Email         │Role     │Status  │••│ │
│  ├──┼──────────┼──────────────┼─────────┼────────┼──┤ │
│  │□ │admin     │admin@ex.com  │Admin    │Active  │••│ │
│  │□ │johndoe   │john@ex.com   │User     │Active  │••│ │
│  │□ │janedoe   │jane@ex.com   │Viewer   │Inactive│••│ │
│  └──┴──────────┴──────────────┴─────────┴────────┴──┘ │
│                                                        │
│  Actions: [Bulk Activate]  [Bulk Deactivate]          │
│           [Export User List]                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Add/Edit User Modal:**
```
┌────────────────────────────────┐
│  Add New User             [✕] │
├────────────────────────────────┤
│  Nama Lengkap: *               │
│  [_____________________]       │
│                                │
│  Username: *                   │
│  [_____________________]       │
│                                │
│  Email: *                      │
│  [_____________________]       │
│                                │
│  Password: *                   │
│  [_____________________] 👁️   │
│                                │
│  Role: *                       │
│  ○ Admin (full access)         │
│  ● User (manage surat)         │
│  ○ Viewer (read-only)          │
│                                │
│  Unit/Bagian:                  │
│  [Pilih unit... ▼]             │
│                                │
│  Status:                       │
│  ☑ Active                      │
│                                │
│  Permissions:                  │
│  ☑ Create surat                │
│  ☑ Edit surat                  │
│  ☑ Delete surat                │
│  ☑ Export reports              │
│  ☐ Manage users                │
│  ☐ System settings             │
│                                │
│  [Cancel]  [Create User]       │
└────────────────────────────────┘
```

**Role Permissions Matrix:**
```
┌──────────────┬───────┬──────┬────────┐
│ Permission   │ Admin │ User │ Viewer │
├──────────────┼───────┼──────┼────────┤
│ View surat   │   ✓   │  ✓   │   ✓    │
│ Create surat │   ✓   │  ✓   │   ✗    │
│ Edit surat   │   ✓   │  ✓   │   ✗    │
│ Delete surat │   ✓   │  ✓   │   ✗    │
│ Disposisi    │   ✓   │  ✓   │   ✗    │
│ Export       │   ✓   │  ✓   │   ✓    │
│ Manage users │   ✓   │  ✗   │   ✗    │
│ Settings     │   ✓   │  ✗   │   ✗    │
│ Audit log    │   ✓   │  ✗   │   ✗    │
└──────────────┴───────┴──────┴────────┘
```

#### 5.9.4 Kategori Surat (`/settings/kategori`)

```
┌────────────────────────────────────────────────────────┐
│  🏷️ Master Kategori Surat              [+ Tambah]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Drag to reorder:                                      │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☰ 📧 Undangan              [Edit]  [Delete]      │ │
│  │   Keywords: undangan, hadir, acara...            │ │
│  │   Color: Purple (#8B5CF6)                        │ │
│  │   Total surat: 68                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☰ 📢 Pengumuman            [Edit]  [Delete]      │ │
│  │   Keywords: pengumuman, pemberitahuan...         │ │
│  │   Color: Pink (#EC4899)                          │ │
│  │   Total surat: 112                               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ☰ 📝 Permohonan            [Edit]  [Delete]      │ │
│  │   Keywords: permohonan, mohon, mengajukan...     │ │
│  │   Color: Amber (#F59E0B)                         │ │
│  │   Total surat: 87                                │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [+ Tambah Kategori Baru]                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Edit Kategori Modal:** (Same as shown in section 5.6.2)

#### 5.9.5 System Settings (`/settings/system`)

```
┌────────────────────────────────────────────────────────┐
│  ⚙️ System Configuration                               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Informasi Instansi                                    │
│  ──────────────────                                    │
│  Nama Instansi:                                        │
│  [Dinas Pendidikan Kota Bandung________________]       │
│                                                        │
│  Alamat:                                               │
│  [Jl. Example No. 123_________________________]       │
│  [Bandung, Jawa Barat_________________________]       │
│                                                        │
│  Telepon:                                              │
│  [022-1234567_________________________________]       │
│                                                        │
│  Email:                                                │
│  [info@disdik.bandung.go.id___________________]       │
│                                                        │
│  Logo Instansi:                                        │
│  [Current Logo] [Upload New]  [Remove]                 │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Pengaturan Nomor Surat                                │
│  ──────────────────────────                            │
│  Format Nomor Surat Masuk:                             │
│  [XXX/SM/UNIT/MM/YYYY__________________________]      │
│  Preview: 001/SM/UMUM/02/2026                          │
│                                                        │
│  Format Nomor Surat Keluar:                            │
│  [XXX/SK/UNIT/MM/YYYY__________________________]      │
│  Preview: 001/SK/UMUM/02/2026                          │
│                                                        │
│  Counter reset:                                        │
│  ○ Setiap bulan    ● Setiap tahun    ○ Never          │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  File Upload Settings                                  │
│  ────────────────────                                  │
│  Maximum file size:                                    │
│  [10_] MB                                              │
│                                                        │
│  Allowed formats:                                      │
│  ☑ PDF    ☑ DOC/DOCX    ☑ JPG/PNG    ☐ ZIP           │
│                                                        │
│  Storage location:                                     │
│  ○ Local server    ● Cloud (S3/MinIO)                 │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  OCR Settings                                          │
│  ────────────                                          │
│  OCR Engine: [Tesseract ▼]                            │
│  Language: [Indonesia (ind) ▼]                        │
│  DPI for conversion: [300__] dpi                       │
│                                                        │
│  ☑ Auto-process uploaded files                        │
│  ☑ Save OCR text to database                          │
│  ☐ Enable multi-language detection                    │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  [Reset to Default]  [Test Configuration]  [Save]     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.9.6 Backup Settings (`/settings/backup`)

```
┌────────────────────────────────────────────────────────┐
│  💾 Backup & Restore                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Automatic Backup                                      │
│  ─────────────────                                     │
│  ☑ Enable automatic backup                            │
│                                                        │
│  Backup schedule:                                      │
│  ● Daily at [02:00] AM                                 │
│  ○ Weekly on [Sunday ▼]                                │
│  ○ Monthly on [1st ▼] day                              │
│                                                        │
│  Backup includes:                                      │
│  ☑ Database                                            │
│  ☑ Uploaded files                                      │
│  ☑ System configuration                                │
│                                                        │
│  Retention policy:                                     │
│  Keep last [7__] backups                               │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Manual Backup                                         │
│  ──────────────                                        │
│  Last backup: 09/02/2026 02:00 AM                      │
│  Size: 250 MB                                          │
│                                                        │
│  [Create Backup Now]  [Download Last Backup]           │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Backup History                                        │
│  ───────────────                                       │
│  ┌────────────────┬──────────┬──────────┬──────────┐  │
│  │ Date           │ Type     │ Size     │ Action   │  │
│  ├────────────────┼──────────┼──────────┼──────────┤  │
│  │ 09/02/26 02:00 │ Auto     │ 250 MB   │ Download │  │
│  │ 08/02/26 02:00 │ Auto     │ 248 MB   │ Download │  │
│  │ 07/02/26 15:30 │ Manual   │ 245 MB   │ Download │  │
│  └────────────────┴──────────┴──────────┴──────────┘  │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Restore from Backup                                   │
│  ────────────────────                                  │
│  ⚠️ Warning: This will overwrite current data!         │
│                                                        │
│  Select backup file:                                   │
│  [Choose file...] or [Select from history ▼]          │
│                                                        │
│  [Restore] (requires admin password)                   │
│                                                        │
│  [Save Settings]                                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 5.9.7 Notification Settings (`/settings/notifications`)

```
┌────────────────────────────────────────────────────────┐
│  🔔 Notification Settings                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  In-App Notifications                                  │
│  ─────────────────────                                 │
│  ☑ Enable in-app notifications                        │
│  ☑ Show notification badge                            │
│  ☑ Desktop notifications (browser)                    │
│                                                        │
│  Notify me when:                                       │
│  ☑ New surat masuk                                    │
│  ☑ Surat disposisi ke saya                            │
│  ☑ Disposisi saya diselesaikan                        │
│  ☑ Deadline approaching (2 days before)               │
│  ☐ System maintenance scheduled                       │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Email Notifications                                   │
│  ────────────────────                                  │
│  ☑ Enable email notifications                         │
│                                                        │
│  Email me when:                                        │
│  ☑ New disposisi assigned to me                       │
│  ☑ Urgent surat received                              │
│  ☐ Daily digest (summary)                             │
│  ☐ Weekly report                                      │
│                                                        │
│  Email delivery time:                                  │
│  Daily digest: [08:00] AM                              │
│  Weekly report: [Monday ▼] at [09:00] AM              │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  SMTP Configuration (Admin only)                       │
│  ───────────────────                                   │
│  SMTP Host: [smtp.gmail.com________________]          │
│  SMTP Port: [587___]                                   │
│  Username: [notifications@example.com______]          │
│  Password: [********************] 👁️                 │
│  From Name: [Sistem Arsip Surat____________]          │
│  From Email: [noreply@example.com__________]          │
│                                                        │
│  [Test Email]  [Save Settings]                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 5.10 Notifications / Riwayat (`/notifications`)

**Page Layout:**
```
┌────────────────────────────────────────────────────────┐
│  🔔 Notifikasi                          [Mark all read]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  [All]  [Unread (5)]  [Disposisi]  [System]           │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ● 📨 Surat masuk baru                            │ │
│  │   Surat #123 dari Dinas A - Undangan Rapat      │ │
│  │   2 minutes ago                      [Mark read] │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ● 📤 Disposisi baru                              │ │
│  │   User A mendisposisikan surat #124 kepada Anda  │ │
│  │   15 minutes ago                     [Mark read] │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ○ ✅ Disposisi selesai                           │ │
│  │   User B menyelesaikan surat #122                │ │
│  │   1 hour ago                         [Delete]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ○ ⏰ Deadline reminder                           │ │
│  │   Surat #120 jatuh tempo dalam 2 hari            │ │
│  │   3 hours ago                        [Delete]    │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Load more...]                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Notification Types:**
- 📨 Surat baru (blue)
- 📤 Disposisi (yellow)
- ✅ Status update (green)
- ⏰ Reminder (orange)
- ⚠️ Warning (red)
- ℹ️ Info (gray)

**Real-time Updates:**
- WebSocket connection
- Browser notification API
- Sound notification (optional)
- Badge counter update

---

### 5.11 Disposisi Surat

#### 5.11.1 Form Disposisi (Modal)

Dapat diakses dari:
- Detail surat (button "Disposisi")
- Bulk action di table
- Quick action di dashboard

**Form Layout:**
```
┌────────────────────────────────────────────────────────┐
│  📤 Disposisi Surat                               [✕]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Surat: #001/SM/2026 - Undangan Rapat Koordinasi      │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  Tujuan Disposisi: *                                   │
│  [Pilih user/unit... ▼]                                │
│  Selected: [User B ✕]  [User C ✕]                     │
│                                                        │
│  Jenis Disposisi:                                      │
│  ○ Untuk ditindaklanjuti                               │
│  ○ Untuk diketahui                                     │
│  ● Untuk diperiksa dan dikembalikan                    │
│  ○ Sesuai catatan                                      │
│                                                        │
│  Prioritas:                                            │
│  ○ Rendah    ● Sedang    ○ Tinggi    ○ Urgent         │
│                                                        │
│  Batas Waktu (Optional):                               │
│  [📅 DD/MM/YYYY]  [⏰ HH:MM]                           │
│                                                        │
│  Catatan/Instruksi: *                                  │
│  [                                                 ]   │
│  [                                                 ]   │
│  [                                                 ]   │
│                                                        │
│  Lampiran Tambahan (Optional):                         │
│  [Drag & drop file...]                                 │
│                                                        │
│  ☑ Kirim notifikasi email                             │
│  ☐ Request tanda tangan digital                       │
│                                                        │
│  [Cancel]  [Save as Draft]  [Send Disposisi]           │
│                                                        │
└────────────────────────────────────────────────────────│
```
#### 5.11.2 Tracking Disposisi

**Timeline View (di Detail Surat):**
```
┌────────────────────────────────────────────────────────┐
│  📋 Riwayat Disposisi                                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ● [Admin] → [User A]                                 │
│    📤 Untuk ditindaklanjuti                            │
│    "Mohon segera ditindaklanjuti"                      │
│    Status: ✅ Selesai                                  │
│    08/02/2026 09:00 - Selesai: 08/02/2026 15:30       │
│    Duration: 6 hours 30 minutes                        │
│                                                        │
│  ● [User A] → [User B]                                │
│    📤 Untuk diperiksa                                  │
│    "Mohon review dan berikan feedback"                 │
│    Status: 🔄 Dalam Proses                            │
│    08/02/2026 15:45 - Deadline: 10/02/2026            │
│    ⏰ 1 day remaining                                  │
│                                                        │
│  ○ [User B] → [Pending...]                            │
│    Status: ⏳ Menunggu                                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**My Disposisi Page (`/disposisi`):**
```
┌────────────────────────────────────────────────────────┐
│  📬 Disposisi Saya                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Diterima]  [Dikirim]  [Selesai]  [Overdue]          │
│                                                        │
│  Filter: [All ▼]  [Priority ▼]  [Date ▼]              │
│                                                        │
│  ┌──┬────────┬────────┬──────────┬─────────┬────────┐ │
│  │□ │No Surat│Dari    │Instruksi │Deadline │Status  │ │
│  ├──┼────────┼────────┼──────────┼─────────┼────────┤ │
│  │□ │001/SM  │Admin   │Tindak..  │10/02/26 │Process │ │
│  │□ │002/SM  │User A  │Review..  │11/02/26 │New     │ │
│  └──┴────────┴────────┴──────────┴─────────┴────────┘ │
│                                                        │
│  [Mark as Complete]  [Forward]  [Reply]                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 6. FEATURES

### 6.1 Core Features (MVP)

#### A. Authentication & Authorization

**1. Login System**
- Username/Email + Password authentication
- JWT token-based session management
- Remember me functionality
- Secure password hashing (bcrypt)
- Failed login tracking & account lockout
- Session timeout (configurable)

**2. User Roles & Permissions**

*Role Hierarchy:*
- **Admin**: Full system access
  - All CRUD operations
  - User management
  - System configuration
  - Audit log access
  - Delete operations

- **User**: Standard operations
  - Create/edit surat
  - Upload documents
  - Disposisi surat
  - Export reports
  - View own data + assigned disposisi

- **Viewer**: Read-only access
  - View surat
  - View reports
  - Export allowed (but not modify)
  - Cannot create/edit/delete

**3. Session Management**
- Active session tracking
- Multi-device login support
- Force logout all devices
- Session expiration notification

---

#### B. Manajemen Surat Masuk

**1. Input Data**
- Manual form input dengan validation
- Auto-save draft functionality
- Required field indicators
- Data validation (format, uniqueness)
- Autocomplete untuk field berulang

**2. Upload File**
- Drag & drop interface
- Multiple file formats: PDF, DOC/DOCX, JPG, PNG
- File size limit: 10MB
- Progress bar saat upload
- File preview sebelum save
- Multiple files per surat (optional)

**3. OCR Processing**
- Automatic text extraction
- Support PDF, Word, Image
- Background processing (async dengan Celery)
- Progress notification
- OCR result preview & edit
- Save extracted text to database

**4. Data Management**
- List view dengan table
- Detail view dengan file preview
- Edit existing records
- Soft delete (archiving)
- Bulk operations support
- Data validation

**5. Search & Filter**
- Quick search bar
- Advanced filters:
  - Date range
  - Kategori
  - Status
  - Priority
  - Pengirim
- Full-text search
- Search in OCR text
- Save search queries

---

#### C. Manajemen Surat Keluar

**Features sama dengan Surat Masuk plus:**

**1. Auto-numbering**
- Format: XXX/SK/UNIT/MM/YYYY
- Auto-increment per periode
- Customizable format
- Duplicate number prevention
- Manual override (admin)

**2. Template Support (Optional)**
- Pre-defined letter templates
- Mail merge capability
- Variable replacement
- Template library

**3. Additional Fields**
- Penerima (destination)
- Tembusan (CC)
- Referensi surat masuk
- Lampiran list

#### D. Klasifikasi Otomatis

**1. OCR-Based Classification**
- Text extraction via Tesseract
- Text preprocessing:
  - Lowercase normalization
  - Special character removal
  - Tokenization
  - Stop words removal

**2. Rule-Based Keyword Matching**
- Keyword dictionary per kategori
- Scoring system:
  - Exact match: 3 points
  - Partial match: 1 point
  - Position weight: +2 points (if keyword in first 20%)
- Category selection: highest score wins
- Confidence score calculation

**3. Auto-tagging**
- Extract relevant keywords
- Suggest tags based on content
- Frequency analysis
- Tag management

**4. Manual Override**
- User can review and edit
- Confidence threshold indicator
- "Perlu Review" status untuk low confidence
- Batch re-classification

**5. Configuration**
- Adjustable confidence threshold
- Customizable keyword dictionary
- Add/edit/delete categories
- Test classification tool
- Import/export configurations

---

#### E. Dashboard & Analytics

**1. Statistics Overview**
- Total surat masuk (current period)
- Total surat keluar (current period)
- Pending classification count
- Completed disposisi today
- Percentage change vs previous period

**2. Visual Charts**
- Line chart: Trend surat 6 bulan terakhir
- Pie chart: Distribusi kategori
- Bar chart: Top senders/receivers
- Timeline: Recent activities

**3. Quick Actions**
- Button tambah surat masuk
- Button tambah surat keluar
- Quick export
- Jump to pending items

**4. Real-time Updates**
- Auto-refresh statistics
- WebSocket updates untuk notifikasi
- Live activity feed

**5. Customization**
- Widget arrangement (drag & drop)
- Show/hide widgets
- Date range selection
- Export dashboard data

---

#### F. Search & Filter

**1. Quick Search**
- Search bar di top navigation
- Global search across all surat
- Autocomplete suggestions
- Recent searches

**2. Advanced Filters**
- Multiple filter combinations
- Date range picker
- Multi-select dropdowns
- Custom filter builder
- Filter presets

**3. Full-Text Search**
- Search in all text fields
- Search in OCR extracted text
- Search in disposisi notes
- Highlight search results

**4. Saved Searches**
- Save filter combinations
- Named searches
- Quick load
- Share with other users

**5. Sort & Group**
- Multi-column sorting
- Group by kategori/status/date
- Custom sort orders
- Remember sort preferences

---

#### G. Export & Reporting

**1. Export Formats**

*Excel (.xlsx):*
- Multiple sheets
- Formatted tables
- Charts embedded
- Auto-width columns
- Cell styling
- Formulas
- Data validation

*PDF:*
- Professional layout
- Header with logo
- Table of contents
- Page numbers
- Digital signature placeholder
- Watermark support

*Google Sheets:*
- Direct upload
- Auto-formatting
- Share link generation
- Permission management
- Real-time collaboration

**2. Report Templates**

*Laporan Ringkasan:*
- Executive summary
- Key statistics
- Charts & graphs
- Period comparison

*Laporan Detail:*
- Complete data listing
- All fields included
- Disposisi history
- Attachment references

*Laporan Per Kategori:*
- Grouped by category
- Category statistics
- Comparison charts
- Sub-totals

*Custom Report:*
- User-defined fields
- Custom grouping
- Calculated fields
- Custom formulas

**3. Report Features**
- Date range selection
- Filter by multiple criteria
- Preview before export
- Batch export
- Schedule reports (future)
- Email delivery (future)

**4. Report History**
- Track generated reports
- Re-download previous reports
- Report metadata
- Usage statistics

---

#### H. File Management

**1. Upload System**
- Secure file upload
- Virus scanning (optional)
- File type validation
- Size limit enforcement
- Duplicate detection
- Chunked upload untuk large files

**2. Storage**
- Organized folder structure
- Year/Month/Type hierarchy
- Unique filename generation
- Metadata storage
- Cloud storage support (S3/MinIO)

**3. File Preview**
- PDF viewer (embedded)
- Image viewer dengan zoom
- Document preview
- Multi-page navigation
- Download original

**4. File Versioning (Optional)**
- Track file changes
- Version history
- Restore previous version
- Compare versions

**5. Security**
- Access control
- Encrypted storage (optional)
- Audit trail
- Secure download links
- Expiring URLs

---

### 6.2 Advanced Features (Post-MVP)

#### A. Disposisi Surat

**1. Workflow Management**
- Multi-level disposisi
- Parallel disposisi (multiple recipients)
- Sequential workflow
- Conditional routing
- Workflow templates

**2. Tracking**
- Real-time status tracking
- Timeline visualization
- Duration tracking
- SLA monitoring
- Bottleneck detection

**3. Actions**
- Forward to others
- Reply with notes
- Request clarification
- Mark as complete
- Reject/return
- Escalate

**4. Notifications**
- New disposisi alerts
- Deadline reminders
- Status change notifications
- Escalation alerts
- Daily digest

---

#### B. Notifikasi & Reminder

**1. In-App Notifications**
- Real-time push notifications
- Notification center
- Badge counters
- Sound alerts (optional)
- Desktop notifications (browser API)

**2. Email Notifications**
- Configurable triggers
- Email templates
- Batch sending
- Unsubscribe option
- Delivery tracking

**3. Reminder System**
- Deadline reminders
- Follow-up reminders
- Scheduled reminders
- Recurring reminders
- Snooze functionality

**4. Notification Preferences**
- Per-user settings
- Notification channels (app/email/both)
- Quiet hours
- Priority filtering
- Grouped notifications

---

#### C. Digital Signature (Future)

**1. E-Signature Integration**
- Digital certificate support
- Signature pad
- Signature verification
- Timestamp service
- Certificate management

**2. Approval Workflow**
- Multi-level approval
- Signature tracking
- Audit trail
- Legal compliance
- Rejection handling

---

#### D. Mobile App (Future)

**1. Mobile Platform**
- Progressive Web App (PWA)
- React Native app (iOS/Android)
- Offline capability
- Push notifications
- Biometric login

**2. Mobile Features**
- Camera scan untuk upload
- Quick view surat
- Approve/reject disposisi
- Voice notes
- Location tagging

---

#### E. Integration

**1. Email Integration**
- Auto-import dari email
- Email parser
- Attachment extraction
- Auto-classification
- Reply via email

**2. API**
- RESTful API
- API documentation (Swagger)
- API authentication (API key/OAuth)
- Rate limiting
- Webhook support

**3. Third-party Integration**
- Cloud storage (Google Drive, Dropbox)
- Calendar integration
- Messaging apps (WhatsApp, Telegram)
- Document management systems
- HR systems

---

#### F. Advanced Analytics

**1. Predictive Analytics**
- Forecast surat volume
- Predict processing time
- Identify trends
- Anomaly detection
- Capacity planning

**2. Performance Metrics**
- Response time tracking
- SLA compliance
- User productivity
- Bottleneck analysis
- Efficiency scores

**3. Custom Dashboards**
- Drag-and-drop builder
- Custom widgets
- Data visualization
- Export dashboards
- Share dashboards

**4. Reports**
- Automated reporting
- Scheduled delivery
- Interactive reports
- Drill-down capability
- Export to BI tools

---

## 7. DATABASE DESIGN

### 7.1 Tabel Users

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user', 'viewer') DEFAULT 'user',
    unit VARCHAR(100),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

### 7.2 Tabel Surat

```sql
CREATE TABLE surat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jenis ENUM('masuk', 'keluar') NOT NULL,
    nomor_surat VARCHAR(100) UNIQUE NOT NULL,
    tanggal_surat DATE NOT NULL,
    tanggal_terima DATE, -- untuk surat masuk
    pengirim VARCHAR(255), -- untuk surat masuk
    penerima VARCHAR(255), -- untuk surat keluar
    perihal VARCHAR(500) NOT NULL,
    deskripsi TEXT,
    kategori_id INT,
    prioritas ENUM('rendah', 'sedang', 'tinggi', 'urgent') DEFAULT 'sedang',
    status ENUM('baru', 'proses', 'selesai', 'archived') DEFAULT 'baru',
    file_path VARCHAR(500),
    file_size INT, -- in bytes
    file_type VARCHAR(50),
    ocr_text TEXT,
    klasifikasi_auto VARCHAR(100),
    confidence_score DECIMAL(5,2),
    keywords JSON, -- array of keywords
    tags JSON, -- array of tags
    created_by INT NOT NULL,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_nomor_surat (nomor_surat),
    INDEX idx_jenis (jenis),
    INDEX idx_tanggal_surat (tanggal_surat),
    INDEX idx_kategori (kategori_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    FULLTEXT idx_fulltext (perihal, deskripsi, ocr_text)
);
```

### 7.3 Tabel Kategori

```sql
CREATE TABLE kategori (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) UNIQUE NOT NULL,
    deskripsi TEXT,
    keywords JSON, -- array of keywords for classification
    color VARCHAR(7), -- hex color code
    icon VARCHAR(50),
    score_exact INT DEFAULT 3,
    score_partial INT DEFAULT 1,
    score_position INT DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nama (nama)
);
```

### 7.4 Tabel Disposisi

```sql
CREATE TABLE disposisi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    surat_id INT NOT NULL,
    dari_user_id INT NOT NULL,
    ke_user_id INT NOT NULL,
    jenis_disposisi ENUM('tindak_lanjut', 'ketahui', 'periksa', 'sesuai_catatan') NOT NULL,
    prioritas ENUM('rendah', 'sedang', 'tinggi', 'urgent') DEFAULT 'sedang',
    catatan TEXT,
    deadline TIMESTAMP NULL,
    status ENUM('pending', 'process', 'completed', 'rejected') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    completed_note TEXT,
    file_path VARCHAR(500), -- lampiran disposisi
    parent_disposisi_id INT, -- untuk tracking chain disposisi
    is_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (surat_id) REFERENCES surat(id) ON DELETE CASCADE,
    FOREIGN KEY (dari_user_id) REFERENCES users(id),
    FOREIGN KEY (ke_user_id) REFERENCES users(id),
    FOREIGN KEY (parent_disposisi_id) REFERENCES disposisi(id),
    INDEX idx_surat (surat_id),
    INDEX idx_dari_user (dari_user_id),
    INDEX idx_ke_user (ke_user_id),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
);
```

### 7.5 Tabel Notifikasi

```sql
CREATE TABLE notifikasi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tipe ENUM('surat_masuk', 'disposisi', 'deadline', 'status_update', 'system') NOT NULL,
    judul VARCHAR(255) NOT NULL,
    pesan TEXT NOT NULL,
    link VARCHAR(500), -- link ke resource terkait
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    surat_id INT,
    disposisi_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (surat_id) REFERENCES surat(id) ON DELETE CASCADE,
    FOREIGN KEY (disposisi_id) REFERENCES disposisi(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

### 7.6 Tabel Audit Logs

```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_data JSON,
    new_data JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
);
```

### 7.7 Tabel Settings

```sql
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- public settings can be accessed by non-admin
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_key (setting_key)
);
```

### 7.8 Tabel File Attachments (Optional)

```sql
CREATE TABLE attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    surat_id INT,
    disposisi_id INT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (surat_id) REFERENCES surat(id) ON DELETE CASCADE,
    FOREIGN KEY (disposisi_id) REFERENCES disposisi(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_surat (surat_id),
    INDEX idx_disposisi (disposisi_id)
);
```

### 7.9 Tabel Backup History

```sql
CREATE TABLE backup_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    backup_type ENUM('auto', 'manual') NOT NULL,
    status ENUM('success', 'failed', 'in_progress') DEFAULT 'in_progress',
    error_message TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_created_at (created_at)
);
```

### 7.10 Entity Relationship Diagram (ERD)

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐      ┌──────────────┐
│   surat     │──N:1─│  kategori    │
└──────┬──────┘      └──────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐
│  disposisi  │──┐
└──────┬──────┘  │
       │         │ self-reference
       │ 1:N     │ (parent_disposisi)
       │         │
┌──────▼──────┐  │
│ notifikasi  │◄─┘
└─────────────┘

┌──────────────┐
│  audit_logs  │
└──────────────┘

┌──────────────┐
│  settings    │
└──────────────┘

┌──────────────┐
│ attachments  │
└──────────────┘

┌──────────────┐
│backup_history│
└──────────────┘
```

---

## 8. SECURITY & PERFORMANCE

### 8.1 Security Measures

#### Authentication
- Password hashing dengan bcrypt (cost factor: 12)
- JWT token dengan expiration (24 hours default)
- Refresh token mechanism
- Secure HTTP-only cookies
- CSRF protection
- Rate limiting untuk login (max 5 attempts per 15 minutes)
- Account lockout setelah failed attempts
- Password strength requirements:
  - Minimum 8 characters
  - At least 1 uppercase
  - At least 1 number
  - At least 1 special character

#### Authorization
- Role-based access control (RBAC)
- Permission matrix implementation
- Row-level security untuk data access
- API endpoint protection
- Resource ownership validation

#### Data Security
- Input validation & sanitization
- SQL injection prevention (ORM parameterized queries)
- XSS protection
- File upload validation:
  - File type whitelist
  - Magic number verification
  - File size limits
  - Malware scanning (ClamAV - optional)
- Encrypted file storage (optional)
- Secure file download URLs dengan expiration

#### Network Security
- HTTPS/TLS enforcement
- CORS configuration
- Content Security Policy (CSP)
- HTTP security headers:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security
  - X-XSS-Protection

#### API Security
- API rate limiting (per user/IP)
- API key authentication
- Request signature validation
- Payload size limits
- API versioning

#### Audit & Monitoring
- Comprehensive audit logging
- Failed access attempt tracking
- Security event monitoring
- Anomaly detection
- Regular security scans

### 8.2 Performance Optimization

#### Database Optimization
- Proper indexing strategy:
  - Primary keys
  - Foreign keys
  - Frequently queried columns
  - Full-text search indexes
- Query optimization:
  - Use EXPLAIN for query analysis
  - Avoid N+1 queries
  - Use JOIN appropriately
  - Limit result sets
- Database connection pooling
- Read replicas untuk read-heavy operations
- Partition large tables (by year/month)

#### Caching Strategy
- Redis caching layer:
  - User sessions
  - Frequently accessed data
  - API responses
  - Search results
  - Statistics/analytics
- Cache invalidation strategy
- Cache warming untuk critical data
- Browser caching untuk static assets
- CDN untuk static files

#### Backend Optimization
- Async processing dengan Celery:
  - OCR processing
  - File uploads
  - Report generation
  - Email sending
  - Batch operations
- API response pagination
- Lazy loading
- Database query optimization
- Compression (gzip/brotli)
- Code profiling & optimization

#### Frontend Optimization
- Code splitting
- Lazy loading components
- Image optimization:
  - Compression
  - WebP format
  - Responsive images
  - Lazy loading
- Minification (JS, CSS)
- Tree shaking
- Bundle size optimization
- Virtual scrolling untuk large lists
- Debouncing/throttling untuk search
- React Query caching

#### File Storage Optimization
- Chunked file uploads
- Multipart upload untuk large files
- Compression untuk documents
- Thumbnail generation untuk images
- Progressive PDF loading
- CDN untuk file delivery

#### Monitoring & Profiling
- Application Performance Monitoring (APM)
- Database query monitoring
- API response time tracking
- Error rate monitoring
- Resource utilization tracking
- User analytics

---

## 9. DEPLOYMENT PLAN

### 9.1 Development Environment

**Setup:**
```yaml
# Docker Compose for local development
version: '3.8'
services:
  backend:
    image: fastapi-app
    ports: ["8000:8000"]
    
  frontend:
    image: react-dev
    ports: ["3000:3000"]
    
  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    
  redis:
    image: redis:7
    ports: ["6379:6379"]
    
  celery:
    image: celery-worker
    
  mailhog:
    image: mailhog/mailhog
    ports: ["8025:8025"]
```

**Tools:**
- Git version control
- Feature branch workflow
- Pre-commit hooks (linting, formatting)
- VS Code recommended extensions
- Postman collection untuk API testing

### 9.2 Staging Environment

**Purpose:**
- User Acceptance Testing (UAT)
- Integration testing
- Performance testing
- Security testing

**Configuration:**
- Mirror production environment
- Anonymized production data
- Separate database
- Test email server
- Error tracking (Sentry staging)

### 9.3 Production Environment

**Infrastructure:**
```
┌─────────────────────────────────────────┐
│  Load Balancer (Nginx)                  │
│  - SSL Termination                      │
│  - Rate Limiting                        │
│  - Request routing                      │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼───┐
│ App 1 │    │ App 2 │  (FastAPI instances)
└───┬───┘    └───┬───┘
    │             │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   MySQL     │
    │  (Primary)  │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   MySQL     │
    │  (Replica)  │
    └─────────────┘
           
┌─────────────────┐
│  Redis Cluster  │
│  - Cache        │
│  - Session      │
│  - Queue        │
└─────────────────┘

┌─────────────────┐
│ Celery Workers  │
│  - OCR          │
│  - Export       │
│  - Email        │
└─────────────────┘

┌─────────────────┐
│ File Storage    │
│  - S3/MinIO     │
└─────────────────┘
```

**Server Specifications (Minimum):**
- **Application Server**: 2 vCPU, 4GB RAM
- **Database Server**: 2 vCPU, 8GB RAM, SSD storage
- **Redis Server**: 1 vCPU, 2GB RAM
- **Worker Server**: 2 vCPU, 4GB RAM

**Deployment Process:**
1. Build Docker images
2. Push to container registry
3. Pull images on production servers
4. Run database migrations
5. Deploy new containers (zero-downtime)
6. Health check verification
7. Rollback plan ready

**SSL Certificate:**
- Let's Encrypt (free, auto-renewal)
- Or commercial SSL certificate

**Monitoring Stack:**
- Application logs → ELK Stack / Loki
- Metrics → Prometheus + Grafana
- Error tracking → Sentry
- Uptime monitoring → UptimeRobot / Pingdom
- APM → New Relic / Datadog (optional)

**Backup Strategy:**
- **Database**: Daily automated backups
- **Files**: Incremental backups
- **Retention**: 30 days minimum
- **Backup location**: Off-site storage
- **Recovery testing**: Monthly

**Security:**
- Firewall configuration
- Intrusion detection system
- DDoS protection (Cloudflare)
- Regular security updates
- Vulnerability scanning

**Scaling Strategy:**
- Horizontal scaling untuk app servers
- Database read replicas
- CDN untuk static assets
- Queue workers auto-scaling
- Load balancer health checks

---

## 10. TIMELINE & MILESTONES

### Phase 1: Foundation (Week 1-2)

**Week 1:**
- [ ] Project setup & repository initialization
- [ ] Database design & creation
- [ ] Backend scaffolding (FastAPI)
  - Project structure
  - Database connection
  - ORM models
  - Migrations setup
- [ ] Frontend scaffolding (React + Vite)
  - Project structure
  - Routing setup
  - UI library integration (shadcn/ui)
  - State management setup

**Week 2:**
- [ ] Authentication system
  - User registration (admin only)
  - Login/logout
  - JWT implementation
  - Password hashing
  - Session management
- [ ] User management (basic)
  - CRUD operations
  - Role-based access
  - Profile management
- [ ] Basic UI components
  - Layout (sidebar, top bar)
  - Navigation
  - Common components

**Deliverable:** Working authentication system with basic UI

---

### Phase 2: Core Features - Surat Management (Week 3-4)

**Week 3:**
- [ ] Surat Masuk module
  - Database tables & models
  - API endpoints (CRUD)
  - Form input (manual)
  - List view dengan table
  - Detail view
  - Basic validation
- [ ] File upload functionality
  - Upload API endpoint
  - File validation
  - Storage implementation
  - File preview

**Week 4:**
- [ ] Surat Keluar module
  - Similar to Surat Masuk
  - Auto-numbering system
  - Additional fields
- [ ] Kategori management
  - Master kategori CRUD
  - API endpoints
  - UI for kategori settings
- [ ] Search & filter (basic)
  - Search implementation
  - Filter by date, kategori, status
  - Pagination

**Deliverable:** Functional surat masuk/keluar management

---

### Phase 3: OCR & Classification (Week 5-6)

**Week 5:**
- [ ] OCR integration
  - Tesseract setup & configuration
  - PDF to image conversion
  - Text extraction logic
  - OCR API endpoints
  - Background processing (Celery)
  - Progress tracking
- [ ] File format handling
  - PDF processing
  - Word document processing
  - Image processing
  - Format detection

**Week 6:**
- [ ] Classification system
  - Keyword matching algorithm
  - Scoring system implementation
  - Confidence calculation
  - Auto-categorization
  - Manual override functionality
- [ ] OCR result UI
  - OCR progress indicator
  - Result preview & edit
  - Confidence score display
  - Keyword highlighting
- [ ] Classification settings
  - Keyword management UI
  - Threshold configuration
  - Test classification tool

**Deliverable:** Working OCR and auto-classification

---

### Phase 4: Dashboard & Analytics (Week 7-8)

**Week 7:**
- [ ] Dashboard statistics
  - API endpoints untuk stats
  - Database queries optimization
  - Real-time data aggregation
- [ ] Charts implementation
  - Line chart (trend)
  - Pie chart (categories)
  - Bar chart (top items)
  - Recharts integration
- [ ] Recent activities
  - Activity logging
  - Timeline component
  - Real-time updates

**Week 8:**
- [ ] Export functionality
  - Excel export (openpyxl)
  - PDF export (ReportLab)
  - Report templates
  - Filter & customization
  - Preview functionality
- [ ] Google Sheets integration
  - OAuth setup
  - Sheets API integration
  - Upload & formatting
  - Share link generation

**Deliverable:** Complete dashboard and export features

---

### Phase 5: Advanced Features (Week 9-10)

**Week 9:**
- [ ] Disposisi system
  - Database models
  - API endpoints
  - Disposisi form
  - Workflow logic
  - Status tracking
  - Timeline view
- [ ] Notification system
  - In-app notifications
  - Notification API
  - Real-time push (WebSocket optional)
  - Email notifications (optional)
  - Notification preferences

**Week 10:**
- [ ] Perincian & Archive
  - Advanced search
  - Saved searches
  - Bulk operations
  - Archive management
  - Restore functionality
- [ ] Audit logging
  - Log all actions
  - Audit trail view
  - Export audit logs
- [ ] Settings pages
  - System settings
  - User preferences
  - Backup settings
  - Email configuration

**Deliverable:** Complete feature set

---

### Phase 6: Testing & Polish (Week 11-12)

**Week 11:**
- [ ] Testing
  - Unit tests (backend)
  - Integration tests
  - API testing
  - Frontend component tests
  - End-to-end tests
  - Performance testing
  - Security testing
- [ ] Bug fixes
  - Fix identified issues
  - Edge case handling
  - Error handling improvements

**Week 12:**
- [ ] UI/UX polish
  - Responsive design refinement
  - Loading states
  - Error states
  - Empty states
  - Accessibility improvements
  - Cross-browser testing
- [ ] Documentation
  - API documentation (Swagger)
  - User manual
  - Admin guide
  - Deployment guide
  - Code documentation
- [ ] Performance optimization
  - Query optimization
  - Caching implementation
  - Bundle size optimization
  - Image optimization

**Deliverable:** Production-ready application

---

### Phase 7: Deployment & Training (Week 13-14)

**Week 13:**
- [ ] Deployment preparation
  - Server provisioning
  - Docker setup
  - Database migration
  - SSL certificate
  - Environment configuration
  - Backup system setup
- [ ] Production deployment
  - Deploy to production
  - Smoke testing
  - Monitoring setup
  - Error tracking setup

**Week 14:**
- [ ] User Acceptance Testing (UAT)
  - User testing sessions
  - Feedback collection
  - Issue resolution
- [ ] Training
  - Admin training
  - User training
  - Documentation walkthrough
  - Support materials
- [ ] Handover
  - Project documentation
  - Access credentials
  - Maintenance guide
  - Support plan

**Deliverable:** Live production system with trained users

---

### Post-Launch (Ongoing)

**Month 2-3:**
- [ ] Monitoring & support
  - Daily monitoring
  - Bug fixes
  - User support
  - Performance tuning
- [ ] Feedback iteration
  - User feedback collection
  - Feature requests
  - UI/UX improvements
  - Priority bug fixes

**Month 4-6:**
- [ ] Phase 2 features (from Advanced Features list)
  - Digital signature
  - Mobile app (PWA)
  - Email integration
  - Advanced analytics
  - Scheduled reports
  - Additional integrations

---

## 11. KOREKSI & REKOMENDASI FINAL

### ✅ Yang Sudah Sangat Baik:

1. **Tech Stack Solid**
   - FastAPI untuk backend (fast, modern, async)
   - React + shadcn/ui untuk frontend (modern, maintainable)
   - MySQL untuk database (reliable, proven)

2. **Core Features Jelas**
   - Input surat masuk/keluar
   - OCR extraction dengan Tesseract
   - Rule-based classification (keyword matching)
   - Export multi-format

3. **Scalability**
   - Celery untuk async processing
   - Redis untuk caching
   - Cloud storage ready

### ✅ Fitur yang Telah Ditambahkan:

1. **User Management** ✓
   - Role-based access (Admin, User, Viewer)
   - Permission matrix
   - User CRUD operations

2. **Disposisi System** ✓
   - Multi-level workflow
   - Tracking & timeline
   - Notifications

3. **Audit Trail** ✓
   - Comprehensive logging
   - Activity tracking
   - Security monitoring

4. **Notifikasi** ✓
   - In-app notifications
   - Email notifications
   - Reminder system

5. **Backup System** ✓
   - Automated backups
   - Manual backup
   - Restore functionality

6. **Advanced Search** ✓
   - Full-text search
   - Saved searches
   - Bulk operations

### 💡 Rekomendasi Tambahan:

**Prioritas Tinggi (Untuk MVP):**

1. **Error Handling yang Comprehensive**
   - User-friendly error messages
   - Fallback mechanisms
   - Retry logic untuk network operations
   - Graceful degradation

2. **Data Validation**
   - Server-side validation (critical)
   - Client-side validation (UX)
   - Comprehensive error messages
   - Input sanitization

3. **Testing Strategy**
   - Unit tests minimal 70% coverage
   - Integration tests untuk critical paths
   - E2E tests untuk user flows
   - Load testing

4. **Documentation**
   - API documentation (Swagger auto-generated)
   - User manual (Indonesian)
   - Admin guide
   - Developer documentation
   - Troubleshooting guide

**Prioritas Sedang (Post-MVP):**

1. **Internationalization (i18n)**
   - Support multi-language (Indonesian, English)
   - Date/time localization
   - Number formatting
   - Currency formatting

2. **Dark Mode**
   - Theme switching
   - System preference detection
   - User preference saving
   - Consistent theming

3. **Keyboard Shortcuts**
   - Power user features
   - Quick navigation
   - Command palette (Cmd+K)
   - Accessibility enhancement

4. **Advanced Filtering**
   - Query builder
   - Complex filter combinations
   - Filter templates
   - Filter sharing

**Prioritas Rendah (Future Enhancement):**

1. **Mobile App Native**
   - React Native implementation
   - Offline-first architecture
   - Biometric authentication
   - Camera integration

2. **AI/ML Enhancement**
   - Machine learning classification (beyond rules)
   - Sentiment analysis
   - Automatic summary generation
   - Smart recommendations

3. **Blockchain Integration**
   - Immutable audit trail
   - Document verification
   - Digital signature with blockchain
   - Timestamp service

### 🎯 Success Metrics:

**Technical KPIs:**
- System uptime: >99.5%
- API response time: <500ms (p95)
- OCR processing: <30 seconds per document
- Search latency: <200ms
- Page load time: <3 seconds

**User KPIs:**
- Classification accuracy: >85%
- User adoption rate: >80% within 3 months
- Daily active users: Target based on organization size
- Average time to process surat: Reduction by 50%
- User satisfaction score: >4/5

**Business KPIs:**
- Reduction in paper usage: 70%+
- Faster document retrieval: 80% reduction in search time
- Improved compliance: 100% audit trail
- Cost savings from automation: Calculate ROI
- Processing efficiency: 50% faster workflow

### ⚠️ Risks & Mitigation:

**Technical Risks:**
1. **OCR Accuracy**
   - Risk: Low quality scans → poor text extraction
   - Mitigation: Image preprocessing, quality validation, manual override

2. **Performance dengan Large Data**
   - Risk: Slow queries dengan ribuan records
   - Mitigation: Proper indexing, pagination, caching

3. **File Storage Growth**
   - Risk: Storage costs meningkat
   - Mitigation: Cloud storage, compression, archival policy

**User Adoption Risks:**
1. **Resistance to Change**
   - Risk: User prefer manual process
   - Mitigation: Training, gradual rollout, show quick wins

2. **Learning Curve**
   - Risk: Complex UI
   - Mitigation: Intuitive design, tooltips, video tutorials

**Operational Risks:**
1. **Data Migration**
   - Risk: Data loss during migration
   - Mitigation: Thorough testing, backup, rollback plan

2. **Downtime**
   - Risk: System unavailable
   - Mitigation: High availability, backup systems, maintenance windows

---

## 12. KESIMPULAN

Dokumen perancangan ini menyajikan blueprint lengkap untuk sistem **Web Klasifikasi Arsip Surat Masuk dan Surat Keluar** yang akan:

1. **Mendigitalisasi** proses pengelolaan surat dari manual ke digital
2. **Mengotomatisasi** klasifikasi surat menggunakan OCR (Tesseract) dan keyword matching
3. **Meningkatkan efisiensi** dengan workflow disposisi dan tracking
4. **Menyediakan insight** melalui dashboard analytics
5. **Memudahkan pelaporan** dengan export multi-format (Excel, PDF, Google Sheets)
6. **Menjamin keamanan** dengan authentication, authorization, dan audit trail

### Tech Stack Summary:

**Backend:**
- FastAPI (Python 3.10+)
- SQLAlchemy + MySQL 8.0+
- Celery + Redis
- Tesseract OCR

**Frontend:**
- React 18 + TypeScript
- shadcn/ui + Tailwind CSS
- TanStack Query
- Recharts

**Infrastructure:**
- Docker + Docker Compose
- Nginx reverse proxy
- AWS S3 / MinIO (file storage)
- Prometheus + Grafana (monitoring)

### Key Features:

✅ **OCR & Classification** - Otomatis ekstraksi teks dan klasifikasi berbasis keyword  
✅ **Workflow Management** - Disposisi multi-level dengan tracking  
✅ **Analytics Dashboard** - Real-time statistics dan charts  
✅ **Export & Reporting** - Multi-format (XLSX, PDF, Google Sheets)  
✅ **Role-Based Access** - Admin, User, Viewer dengan permission matrix  
✅ **Audit Trail** - Complete logging untuk compliance  
✅ **Search & Filter** - Advanced search dengan full-text support  
✅ **Notifications** - In-app dan email notifications  

### Development Timeline:

**14 Minggu (3.5 Bulan)** untuk MVP lengkap:
- Week 1-2: Foundation & Authentication
- Week 3-4: Surat Management
- Week 5-6: OCR & Classification
- Week 7-8: Dashboard & Export
- Week 9-10: Advanced Features
- Week 11-12: Testing & Polish
- Week 13-14: Deployment & Training

### Arsitektur Advantages:

✅ **Modular** - Easy to maintain dan extend  
✅ **Scalable** - Horizontal scaling capability  
✅ **Secure** - Multiple security layers  
✅ **Performant** - Optimized queries, caching, async processing  
✅ **Extensible** - API-first design untuk integrasi  

### Next Steps:

1. **Review & Approval** dokumen perancangan
2. **Team Formation** - Assign developers
3. **Environment Setup** - Dev, staging, production
4. **Sprint Planning** - Breakdown tasks
5. **Kick-off Meeting** - Align expectations
6. **Sprint 1 Start** - Foundation development

### Maintenance Plan:

**Post-Launch:**
- Daily monitoring
- Weekly progress reviews
- Monthly feature updates
- Quarterly security audits
- Annual major updates

### Support Structure:

**Documentation:**
- User manual (Bahasa Indonesia)
- Admin guide
- API documentation
- Video tutorials
- FAQ

**Training:**
- Admin training (1 day)
- User training (half day)
- Ongoing support
- Help desk setup

### Success Criteria:

✅ System uptime >99.5%  
✅ Classification accuracy >85%  
✅ User adoption >80% in 3 months  
✅ Processing time reduced by 50%  
✅ Zero data loss  
✅ User satisfaction >4/5  

---

**Sistem ini dirancang untuk tumbuh bersama organisasi Anda**, dengan arsitektur yang memungkinkan penambahan fitur dan integrasi di masa depan tanpa perlu major refactoring.

**Dengan mengikuti rancangan ini**, Anda akan memiliki sistem manajemen arsip surat yang modern, efisien, dan scalable yang akan meningkatkan produktivitas dan transparansi dalam pengelolaan surat masuk dan surat keluar.

---

**Document Information:**

- **Version:** 1.0  
- **Last Updated:** 09 Februari 2026  
- **Status:** Final - Ready for Development  
- **Total Pages:** Approximately 100+ (when printed)  
- **Total Sections:** 12 Main Sections  
- **Total Database Tables:** 9 Tables  
- **Estimated Development Time:** 14 Weeks  
- **Estimated Budget:** [To be calculated based on team size]

---

**Prepared By:** Development Team  
**Reviewed By:** [Stakeholder Names]  
**Approved By:** [Management]  

---

**© 2026 - Sistem Arsip Surat | All Rights Reserved**

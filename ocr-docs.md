# Detection

## Analisis Masalah

Hasil yang "ngawur" dari stack tersebut biasanya bukan karena perlu training, tapi karena **Tesseract OCR bekerja secara general** tanpa tahu area mana yang penting. Ada beberapa pendekatan yang bisa kamu pakai **tanpa training**.

---

## Solusi 1: Region-Based Detection (Koordinat/Area)

Jika dokumen punya **layout yang konsisten** (form, KTP, invoice, dll), kamu bisa crop area spesifik sebelum di-OCR:

```python
from PIL import Image
import pytesseract

def extract_region(image_path, region):
    """
    region = (left, top, right, bottom) dalam pixel
    """
    img = Image.open(image_path)
    cropped = img.crop(region)
    text = pytesseract.image_to_string(cropped, lang='ind')
    return text

# Contoh: ambil area nama pada form
REGIONS = {
    "nama"    : (100, 150, 500, 200),
    "nik"     : (100, 210, 500, 260),
    "alamat"  : (100, 270, 500, 350),
}

for field, coords in REGIONS.items():
    result = extract_region("dokumen.png", coords)
    print(f"{field}: {result.strip()}")
```

---

## Solusi 2: Gunakan `pdfplumber` untuk Bounding Box (PDF)

`pdfplumber` jauh lebih powerful dari PyPDF2 untuk ekstraksi terstruktur:

```python
import pdfplumber

with pdfplumber.open("dokumen.pdf") as pdf:
    page = pdf.pages[0]
    
    # Crop area spesifik (x0, top, x1, bottom)
    area = page.crop((50, 100, 400, 200))
    text = area.extract_text()
    print(text)
    
    # Atau ekstrak tabel langsung
    table = page.extract_table()
    print(table)
```

---

## Solusi 3: Preprocessing Image Sebelum OCR

Ini sering jadi **root cause** hasil ngawur — gambar kurang diproses dulu:

```python
import cv2
import numpy as np
from PIL import Image
import pytesseract

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    
    # Convert ke grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    
    # Threshold (binarisasi)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Deskew jika miring
    # (opsional, butuh deteksi sudut)
    
    return thresh

processed = preprocess_image("dokumen.jpg")
text = pytesseract.image_to_string(processed, lang='ind', config='--psm 6')
```

**Config PSM penting:**
| PSM | Kegunaan |
|-----|----------|
| `--psm 6` | Blok teks seragam (paling umum) |
| `--psm 11` | Teks sparse, layout bebas |
| `--psm 3` | Auto (default) |
| `--psm 7` | Satu baris teks |

---

## Kapan Perlu Training?

Training **baru diperlukan** jika:
- Font dokumen sangat unik/tidak standar
- Dokumen handwriting
- Akurasi tetap buruk setelah preprocessing & region crop
- Karakter khusus yang tidak dikenali Tesseract

Untuk dokumen standar (KTP, invoice, form), **koordinat + preprocessing sudah cukup** tanpa training.

---

## Rekomendasi Stack Tambahan

Jika hasil masih kurang memuaskan, pertimbangkan:
- **`easyocr`** — lebih akurat dari Tesseract untuk banyak kasus, zero config
- **`pdfplumber`** sebagai primary (bukan PyPDF2) untuk PDF berbasis teks
- **`opencv-python`** untuk preprocessing sebelum masuk Tesseract

Oke, ini sudah cukup jelas! Untuk **Surat Resmi/Dinas**, strukturnya sangat konsisten dan **tidak perlu training** sama sekali. Pendekatannya bisa pakai kombinasi **regex pattern matching + region detection**.

---

## Arsitektur Solusi

```
Input (PDF/Image/DOCX)
        ↓
  Format Handler
        ↓
  Text Extraction
        ↓
  Section Detector (Regex + Layout)
        ↓
  Structured Output (JSON)
```

---

## Core: Section Detector untuk Surat Resmi

```python
import re
import json
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class SuratResmiResult:
    nomor_surat: Optional[str] = None
    tanggal_surat: Optional[str] = None
    penerima: Optional[str] = None
    jabatan_penerima: Optional[str] = None
    alamat_penerima: Optional[str] = None
    isi_surat: Optional[str] = None
    penutup: Optional[str] = None
    nama_pengirim: Optional[str] = None
    jabatan_pengirim: Optional[str] = None

class SuratResmiDetector:
    
    # ── Pattern untuk setiap bagian ──────────────────────────────
    PATTERNS = {
        "nomor_surat": [
            r"(?:Nomor|No\.?|Nomor\s*Surat)\s*[:\.\-]?\s*([A-Z0-9\/\.\-]+)",
        ],
        "tanggal_surat": [
            r"\b(\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4})\b",
            r"\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b",
        ],
        "penerima": [
            r"(?:Kepada\s*(?:Yth\.?|Yang\s+Terhormat)?|Yth\.?)\s*[:\n]?\s*(?:Bapak\/Ibu\s*)?([^\n]+)",
            r"Kepada\s+(?:Yth\.?)?\s*\n\s*([^\n]+)",
        ],
        "penutup": [
            r"((?:Demikian|Atas perhatian|Hormat kami|Wassalamu)[^\n]*(?:\n[^\n]+){0,3})",
        ],
        "nama_pengirim": [
            r"(?:Hormat\s+(?:kami|saya),?\s*\n+|Ttd\s*\n+|Tanda\s+tangan\s*\n+)([A-Z][a-zA-Z\s\.]+)",
            r"\n([A-Z][A-Z\s\.]{5,})\s*\n\s*NIP",  # nama sebelum NIP
        ],
    }
    
    # ── Keywords untuk deteksi isi surat ─────────────────────────
    ISI_START_KEYWORDS = [
        "Dengan hormat", "Sehubungan dengan", "Bersama ini",
        "Dalam rangka", "Menindaklanjuti", "Memperhatikan"
    ]
    ISI_END_KEYWORDS = [
        "Demikian", "Atas perhatian", "Wassalamu", "Hormat kami"
    ]

    def detect(self, text: str) -> SuratResmiResult:
        result = SuratResmiResult()
        
        result.nomor_surat = self._extract_nomor(text)
        result.tanggal_surat = self._extract_tanggal(text)
        penerima_data = self._extract_penerima(text)
        result.penerima = penerima_data.get("nama")
        result.jabatan_penerima = penerima_data.get("jabatan")
        result.alamat_penerima = penerima_data.get("alamat")
        result.isi_surat = self._extract_isi(text)
        result.penutup = self._extract_penutup(text)
        pengirim_data = self._extract_pengirim(text)
        result.nama_pengirim = pengirim_data.get("nama")
        result.jabatan_pengirim = pengirim_data.get("jabatan")
        
        return result

    def _extract_nomor(self, text: str) -> Optional[str]:
        for pattern in self.PATTERNS["nomor_surat"]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    def _extract_tanggal(self, text: str) -> Optional[str]:
        for pattern in self.PATTERNS["tanggal_surat"]:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    def _extract_penerima(self, text: str) -> dict:
        result = {}
        # Cari blok "Kepada Yth."
        block_match = re.search(
            r"(Kepada\s*(?:Yth\.?)?.*?)(?=\n\s*(?:di\s+|Hal\s*:|Perihal\s*:|Dengan\s+hormat))",
            text, re.IGNORECASE | re.DOTALL
        )
        if block_match:
            block = block_match.group(1)
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            lines = [l for l in lines if not re.match(r"Kepada|Yth\.", l, re.IGNORECASE)]
            
            if lines:
                # Buang prefix Bapak/Ibu jika ada
                nama = re.sub(r"^(Bapak|Ibu|Bapak\/Ibu)\s+", "", lines[0], flags=re.IGNORECASE)
                result["nama"] = nama
            if len(lines) > 1:
                result["jabatan"] = lines[1]
            if len(lines) > 2:
                result["alamat"] = " ".join(lines[2:])
        return result

    def _extract_isi(self, text: str) -> Optional[str]:
        start_idx = None
        end_idx = None
        
        for keyword in self.ISI_START_KEYWORDS:
            idx = text.find(keyword)
            if idx != -1:
                start_idx = idx
                break
        
        for keyword in self.ISI_END_KEYWORDS:
            idx = text.find(keyword)
            if idx != -1 and (end_idx is None or idx < end_idx):
                end_idx = idx
        
        if start_idx and end_idx and start_idx < end_idx:
            return text[start_idx:end_idx].strip()
        return None

    def _extract_penutup(self, text: str) -> Optional[str]:
        for pattern in self.PATTERNS["penutup"]:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        return None

    def _extract_pengirim(self, text: str) -> dict:
        result = {}
        # Cari blok setelah "Hormat kami" sampai akhir dokumen
        block_match = re.search(
            r"(?:Hormat\s+(?:kami|saya)|Wassalamu[^,]*,)\s*\n(.*?)$",
            text, re.IGNORECASE | re.DOTALL
        )
        if block_match:
            block = block_match.group(1)
            lines = [l.strip() for l in block.split("\n") if l.strip()]
            
            for i, line in enumerate(lines):
                # Nama biasanya ALL CAPS atau setelah tanda tangan
                if re.match(r"^[A-Z][A-Z\s\.]+$", line) and len(line) > 5:
                    result["nama"] = line
                    if i + 1 < len(lines) and not re.match(r"NIP|NIK", lines[i+1]):
                        result["jabatan"] = lines[i + 1]
                    break
        return result
    
    def to_json(self, result: SuratResmiResult) -> str:
        return json.dumps(asdict(result), ensure_ascii=False, indent=2)
```

---

## Handler per Format

```python
import pdfplumber
import pytesseract
from PIL import Image
from docx import Document
import cv2
import numpy as np

class DocumentHandler:

    def extract_text(self, file_path: str) -> str:
        ext = file_path.lower().split(".")[-1]
        
        handlers = {
            "pdf"  : self._from_pdf,
            "jpg"  : self._from_image,
            "jpeg" : self._from_image,
            "png"  : self._from_image,
            "docx" : self._from_docx,
        }
        
        handler = handlers.get(ext)
        if not handler:
            raise ValueError(f"Format '{ext}' tidak didukung")
        
        return handler(file_path)

    def _from_pdf(self, path: str) -> str:
        """PDF digital → langsung extract. PDF scan → fallback ke OCR."""
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        # Jika teks kosong, berarti PDF hasil scan
        if not text.strip():
            text = self._pdf_scan_to_text(path)
        
        return text

    def _pdf_scan_to_text(self, path: str) -> str:
        """Convert PDF scan → image → OCR."""
        import fitz  # PyMuPDF
        text = ""
        doc = fitz.open(path)
        for page in doc:
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            img_processed = self._preprocess(img)
            text += pytesseract.image_to_string(img_processed, lang="ind") + "\n"
        return text

    def _from_image(self, path: str) -> str:
        img = Image.open(path)
        img_processed = self._preprocess(img)
        return pytesseract.image_to_string(
            img_processed,
            lang="ind",
            config="--psm 6 --oem 3"
        )

    def _from_docx(self, path: str) -> str:
        doc = Document(path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _preprocess(self, img: Image.Image) -> Image.Image:
        """Preprocessing agar hasil OCR lebih akurat."""
        img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Perbesar resolusi jika terlalu kecil
        if gray.shape[0] < 1000:
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        # Binarisasi adaptif (lebih bagus dari threshold biasa)
        processed = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return Image.fromarray(processed)
```

---

## Pipeline Utama & Output

```python
def process_surat(file_path: str) -> dict:
    handler  = DocumentHandler()
    detector = SuratResmiDetector()
    
    raw_text = handler.extract_text(file_path)
    result   = detector.detect(raw_text)
    
    return {
        "status"  : "success",
        "file"    : file_path,
        "hasil"   : asdict(result),
        "raw_text": raw_text  # simpan untuk debugging
    }

# Contoh penggunaan
output = process_surat("surat_dinas.pdf")
print(json.dumps(output["hasil"], ensure_ascii=False, indent=2))
```

**Contoh output:**
```json
{
  "nomor_surat": "420/234/Disdik/2024",
  "tanggal_surat": "15 Januari 2024",
  "penerima": "Kepala Sekolah SDN 01",
  "jabatan_penerima": "Kepala Sekolah SDN 01 Mataram",
  "alamat_penerima": "di Mataram",
  "isi_surat": "Dengan hormat, sehubungan dengan...",
  "penutup": "Demikian surat ini kami sampaikan...",
  "nama_pengirim": "AHMAD FAUZI, S.Pd",
  "jabatan_pengirim": "Kepala Dinas Pendidikan"
}
```

---

## Tips Tambahan

Kalau masih ada bagian yang miss terdeteksi, lakukan ini secara bertahap:

1. **Print `raw_text` dulu** — pastikan ekstraksi teks sudah benar sebelum deteksi section
2. **Cek hasil OCR** — jika huruf kacau, fokus ke bagian `_preprocess()`
3. **Tambah pattern regex** — sesuaikan dengan format nomor surat instansi yang spesifik
4. **Tambah `PyMuPDF` (`fitz`)** — untuk handle PDF scan lebih baik dari PyPDF2

Perlu saya bantu debug dengan contoh file atau output yang saat ini keluar?

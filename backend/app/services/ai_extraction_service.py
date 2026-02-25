"""
AI-based field extraction service using OpenRouter.

Sends the PDF/image file directly to OpenRouter using the official
"file" content type (type: "file", file_data: "data:application/pdf;base64,...").
This is exactly what the OpenRouter playground does when you upload a PDF.

See: https://openrouter.ai/docs/guides/overview/multimodal/pdfs

Falls back to OCR text if file reading fails.
Gracefully returns empty results on any API/parse error.
"""
import base64
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── System prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """Anda adalah sistem ekstraksi data dari surat resmi Indonesia (surat dinas/surat perintah/memo).

Tugas Anda: baca surat yang diberikan, lalu kembalikan data dalam format JSON.

PENTING: Balas HANYA dengan JSON valid. Jangan tambahkan penjelasan, komentar, markdown, atau teks apapun di luar JSON.

Format output yang HARUS dikembalikan:
{
  "nomor_surat": "...",
  "tanggal_surat": "...",
  "pengirim": "...",
  "penerima": "...",
  "perihal": "...",
  "isi_singkat": "..."
}

Panduan ekstraksi:
- nomor_surat: cari baris "Nomor:" atau "No:" atau pola kode seperti "B/001/XII/2025", "Sprin/007/IV/2024". Ambil nilai setelah label tersebut.
- tanggal_surat: cari tanggal pada surat, konversi ke format YYYY-MM-DD. Contoh: "19 April 2024" → "2024-04-19".
- pengirim: nama instansi dari kop surat (baris paling atas) atau nama/jabatan penandatangan di blok tanda tangan.
- penerima: nama/jabatan yang menerima surat, biasanya setelah "Kepada Yth.", "Kepada :", atau "Ditujukan kepada".
- perihal: isi setelah label "Perihal:", "Hal:", atau judul jenis surat seperti "SURAT PERINTAH", "UNDANGAN", dll.
- isi_singkat: ringkasan singkat maksimal 150 karakter tentang isi/tujuan surat.

Jika field tidak ditemukan dengan jelas, berikan tebakan terbaik berdasarkan konteks. Gunakan null hanya jika benar-benar tidak ada informasi sama sekali.
"""

# ─── Helpers ──────────────────────────────────────────────────────────────────
def _empty() -> Dict[str, Any]:
    fields = ["nomor_surat", "tanggal_surat", "pengirim", "penerima", "perihal", "isi_singkat"]
    return {f: {"value": None, "detected": False} for f in fields}


def _wrap(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Convert AI flat dict → {value, detected} shape."""
    result = {}
    for key in ["nomor_surat", "tanggal_surat", "pengirim", "penerima", "perihal", "isi_singkat"]:
        val = raw.get(key)
        if isinstance(val, str):
            val = val.strip() or None
        result[key] = {"value": val, "detected": val is not None}
    return result


def _parse_json_from_response(content: str) -> Dict[str, Any]:
    """
    Extract and parse the first JSON object from the response.
    Handles models that emit reasoning/thinking text before the JSON.
    """
    start = content.find("{")
    end   = content.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object in response: {content[:200]}")
    return json.loads(content[start:end])


# ─── Service class ─────────────────────────────────────────────────────────────
class AIExtractionService:
    """
    Calls OpenRouter to extract fields from a letter document.
    Sends the raw PDF/image file as base64 using OpenRouter's file API.
    """

    def __init__(self):
        self.api_key: Optional[str] = getattr(settings, "OPENROUTER_API_KEY", None) or None
        self.model: str = getattr(settings, "OPENROUTER_MODEL", "z-ai/glm-4.5-air:free")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.site_url = getattr(settings, "OPENROUTER_SITE_URL", "http://localhost:8000")
        self.site_name = getattr(settings, "PROJECT_NAME", "Arsip Surat")

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    # ── Internal HTTP call ─────────────────────────────────────────────────────
    def _call(self, user_content, plugins: list = None) -> Dict[str, Any]:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_content},
            ],
            "temperature": 0.1,
            # GLM-4.5-air uses ~900 reasoning tokens before emitting JSON.
            # 512 was too small — the JSON never made it into content.
            "max_tokens": 2048,
        }
        if plugins:
            payload["plugins"] = plugins

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
        }

        resp = requests.post(
            self.api_url,
            headers=headers,
            data=json.dumps(payload),
            timeout=60,
        )

        if not resp.ok:
            logger.error("AI HTTP %s: %s", resp.status_code, resp.text[:500])
            return _empty()

        data = resp.json()
        message = data["choices"][0]["message"]
        content = message.get("content") or ""

        # GLM-4.5-Air (and some other free models) put the actual JSON inside
        # the `reasoning` field when max_tokens is consumed by thinking tokens,
        # leaving `content` as an empty string.  Fall back to `reasoning`.
        if not content.strip():
            reasoning = message.get("reasoning") or ""
            if reasoning.strip():
                logger.info("AI: content empty, falling back to reasoning field")
                content = reasoning
            else:
                logger.error("AI: both content and reasoning are empty. Full response: %s", json.dumps(data)[:1000])
                return _empty()

        logger.info("AI raw response content (%d chars): %s", len(content), content[:500])

        raw = _parse_json_from_response(content)
        return _wrap(raw)

    # ── Primary: send the raw file as base64 (PDF or image) ───────────────────
    def extract_from_file(self, file_path: str, ocr_text: str = "") -> Dict[str, Any]:
        """
        Send the actual file to OpenRouter using the official PDF/file API.
        For PDFs:   type="file", file_data="data:application/pdf;base64,..."
        For images: type="image_url", image_url="data:image/png;base64,..."

        Falls back to OCR text if file cannot be read.
        See: https://openrouter.ai/docs/guides/overview/multimodal/pdfs
        """
        if not self.available:
            logger.warning("AI extraction skipped: OPENROUTER_API_KEY not set")
            return _empty()

        path = Path(file_path)
        user_content = None
        plugins = None

        try:
            file_bytes = path.read_bytes()
            suffix = path.suffix.lower()
            b64 = base64.b64encode(file_bytes).decode("utf-8")

            if suffix == ".pdf":
                # Use OpenRouter PDF file API
                # engine: "pdf-text" is free, "mistral-ocr" gives better results
                # for scanned documents ($2/1000 pages)
                data_url = f"data:application/pdf;base64,{b64}"
                user_content = [
                    {
                        "type": "text",
                        "text": (
                            "Ekstrak informasi dari surat berikut.\n"
                            "Kembalikan HANYA JSON, tidak ada teks lain."
                        ),
                    },
                    {
                        "type": "file",
                        "file": {
                            "filename": path.name,
                            "file_data": data_url,
                        },
                    },
                ]
                # Use mistral-ocr for scanned PDFs (like police letters),
                # fall back to pdf-text (free) if not available
                plugins = [
                    {
                        "id": "file-parser",
                        "pdf": {"engine": "mistral-ocr"},
                    }
                ]
                logger.info("AI extraction: sending PDF via file API (%d KB)", len(file_bytes) // 1024)

            elif suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
                # Use image_url for image files
                mime_map = {
                    ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                    ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
                }
                mime = mime_map.get(suffix, "image/png")
                user_content = [
                    {
                        "type": "text",
                        "text": (
                            "Ekstrak informasi dari gambar surat berikut.\n"
                            "Kembalikan HANYA JSON, tidak ada teks lain."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{b64}"},
                    },
                ]
                logger.info("AI extraction: sending image via image_url (%d KB)", len(file_bytes) // 1024)

        except Exception as exc:
            logger.error("AI: failed to read file %s: %s", file_path, exc)

        # Fallback to OCR text if file reading failed
        if user_content is None:
            if not ocr_text.strip():
                logger.warning("AI: no file and no OCR text — skipping")
                return _empty()
            logger.info("AI: falling back to OCR text")
            user_content = (
                "Ekstrak informasi dari teks OCR surat berikut:\n\n"
                f"---\n{ocr_text[:6000]}\n---\n\n"
                "Kembalikan HANYA JSON, tidak ada teks lain."
            )
            plugins = None

        try:
            return self._call(user_content, plugins=plugins)
        except requests.exceptions.Timeout:
            logger.error("AI extraction timeout (60s)")
        except Exception as exc:
            logger.error("AI extraction error: %s", exc)
        return _empty()

    # ── Text-only fallback ────────────────────────────────────────────────────
    def extract(self, ocr_text: str) -> Dict[str, Any]:
        """Text-only extraction — used when no file path is available."""
        if not self.available:
            return _empty()
        if not ocr_text or not ocr_text.strip():
            return _empty()

        user_content = (
            "Ekstrak informasi dari teks OCR surat berikut:\n\n"
            f"---\n{ocr_text[:6000]}\n---\n\n"
            "Kembalikan HANYA JSON, tidak ada teks lain."
        )
        try:
            return self._call(user_content)
        except requests.exceptions.Timeout:
            logger.error("AI extraction timeout")
        except Exception as exc:
            logger.error("AI extraction error: %s", exc)
        return _empty()


# ─── Singleton ────────────────────────────────────────────────────────────────
ai_extraction_service = AIExtractionService()

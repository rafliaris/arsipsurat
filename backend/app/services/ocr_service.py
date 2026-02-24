"""
OCR Service — Improved Pipeline
Uses pdfplumber for digital PDFs, PyMuPDF for scanned PDFs,
and opencv for image preprocessing before Tesseract.
"""
import re
import io
from pathlib import Path
from typing import Tuple, List, Dict, Optional

from PIL import Image
import pytesseract

from app.core.config import settings


class OCRService:

    TESSERACT_CONFIG = "--psm 6 --oem 3"

    def __init__(self):
        if settings.TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

    # ─────────────────────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────────────────────

    def process_file(self, file_path: str, file_type: str) -> Dict[str, object]:
        """
        Extract text from a document using the best available method.
        Returns {'text': str, 'confidence': float, 'keywords': list}.
        Never raises — returns empty result on failure.
        """
        empty = {"text": "", "confidence": 0.0, "keywords": []}
        try:
            ext = Path(file_path).suffix.lower().lstrip(".")
            if ext == "pdf" or "pdf" in file_type.lower():
                text, confidence = self._process_pdf(file_path)
            elif ext in ("jpg", "jpeg", "png") or any(
                t in file_type.lower() for t in ("image", "jpeg", "jpg", "png")
            ):
                text, confidence = self._process_image(file_path)
            else:
                return empty

            keywords = self.extract_keywords(text) if text else []
            return {"text": text, "confidence": confidence, "keywords": keywords}
        except Exception:
            return empty

    def extract_keywords(self, text: str) -> List[str]:
        """Return top-20 keywords (words longer than 3 chars, by frequency)."""
        cleaned = re.sub(r"[^a-z0-9\s]", " ", text.lower())
        freq: Dict[str, int] = {}
        for word in cleaned.split():
            if len(word) > 3:
                freq[word] = freq.get(word, 0) + 1
        return [w for w, _ in sorted(freq.items(), key=lambda x: -x[1])[:20]]

    # ─────────────────────────────────────────────────────────────
    # PDF handling
    # ─────────────────────────────────────────────────────────────

    def _process_pdf(self, path: str) -> Tuple[str, float]:
        """Try pdfplumber first (digital PDF); fall back to PyMuPDF OCR (scanned)."""
        text = self._pdf_digital(path)
        if text and len(text.strip()) > 50:
            # Good digital text — high confidence
            return text.strip(), 90.0

        # Scanned PDF → render via PyMuPDF → Tesseract
        text, confidence = self._pdf_scanned(path)
        return text, confidence

    def _pdf_digital(self, path: str) -> str:
        """Extract text from a digital (text-based) PDF via pdfplumber."""
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text
        except Exception:
            return ""

    def _pdf_scanned(self, path: str) -> Tuple[str, float]:
        """Render scanned PDF pages at 300 DPI via PyMuPDF, then OCR with Tesseract."""
        try:
            import fitz  # PyMuPDF
            all_text = []
            all_conf: List[float] = []
            doc = fitz.open(path)
            for page in doc:
                # Render at 300 DPI
                pix = page.get_pixmap(dpi=300)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                preprocessed = self._preprocess_image(img)
                lang = getattr(settings, "OCR_LANGUAGE", "ind")
                page_text = pytesseract.image_to_string(
                    preprocessed, lang=lang, config=self.TESSERACT_CONFIG
                )
                all_text.append(page_text)
                # Try to get confidence
                try:
                    data = pytesseract.image_to_data(
                        preprocessed, lang=lang, output_type=pytesseract.Output.DICT
                    )
                    confs = [int(c) for c in data["conf"] if str(c).lstrip("-").isdigit() and int(c) >= 0]
                    if confs:
                        all_conf.append(sum(confs) / len(confs))
                except Exception:
                    pass
            text = "\n".join(all_text)
            avg_conf = sum(all_conf) / len(all_conf) if all_conf else 0.0
            return text, round(avg_conf, 2)
        except Exception:
            return "", 0.0

    # ─────────────────────────────────────────────────────────────
    # Image handling
    # ─────────────────────────────────────────────────────────────

    def _process_image(self, path: str) -> Tuple[str, float]:
        """Preprocess image then run Tesseract."""
        img = Image.open(path).convert("RGB")
        preprocessed = self._preprocess_image(img)
        lang = getattr(settings, "OCR_LANGUAGE", "ind")
        text = pytesseract.image_to_string(
            preprocessed, lang=lang, config=self.TESSERACT_CONFIG
        )
        try:
            data = pytesseract.image_to_data(
                preprocessed, lang=lang, output_type=pytesseract.Output.DICT
            )
            confs = [int(c) for c in data["conf"] if str(c).lstrip("-").isdigit() and int(c) >= 0]
            confidence = round(sum(confs) / len(confs), 2) if confs else 0.0
        except Exception:
            confidence = 0.0
        return text, confidence

    # ─────────────────────────────────────────────────────────────
    # Image preprocessing (opencv pipeline)
    # ─────────────────────────────────────────────────────────────

    def _preprocess_image(self, img: Image.Image) -> Image.Image:
        """
        Apply opencv preprocessing to improve Tesseract accuracy:
          1. Convert to grayscale
          2. Upscale if image is too small
          3. Adaptive threshold (binarisation)
        Falls back to original PIL image if opencv is unavailable.
        """
        try:
            import cv2
            import numpy as np

            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

            # Upscale small images for better OCR
            h, w = gray.shape
            if h < 1000:
                scale = 2
                gray = cv2.resize(gray, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)

            # Denoise slightly
            gray = cv2.fastNlMeansDenoising(gray, h=10)

            # Adaptive threshold — handles uneven lighting much better than Otsu
            processed = cv2.adaptiveThreshold(
                gray, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )

            return Image.fromarray(processed)
        except ImportError:
            # opencv not available — use PIL grayscale as fallback
            return img.convert("L")
        except Exception:
            return img


# Singleton
ocr_service = OCRService()

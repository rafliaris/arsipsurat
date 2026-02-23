"""
Extraction Service
Parses OCR text from Indonesian official letters (surat dinas) to extract
structured fields: nomor surat, tanggal, pengirim, perihal, etc.
"""
import re
from datetime import date
from typing import Optional, Dict, Any


# ─────────────────────────────────────────────────────────────
# Indonesian month name mapping
# ─────────────────────────────────────────────────────────────
BULAN_MAP = {
    "januari": 1, "februari": 2, "maret": 3, "april": 4,
    "mei": 5, "juni": 6, "juli": 7, "agustus": 8,
    "september": 9, "oktober": 10, "november": 11, "desember": 12,
    # Abbreviations
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "jun": 6, "jul": 7, "agt": 8, "ags": 8,
    "sep": 9, "okt": 10, "nov": 11, "des": 12,
}


class ExtractionService:
    """
    Service for extracting structured fields from OCR text of official letters.
    All methods are non-fatal — they return None if a field cannot be detected.
    """

    # ──────────────────────
    # Nomor Surat
    # ──────────────────────
    def extract_nomor_surat(self, text: str) -> Optional[str]:
        """
        Extract nomor surat from OCR text.
        Patterns:
          Nomor  : B/001/XII/2025
          No.    : 001/ABC/I/2025
          Nomor Surat : ...
        """
        patterns = [
            r"(?:Nomor\s*Surat|Nomor|No\.?)\s*[:\.]?\s*([A-Z0-9][^\n\r]{2,60})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                nomor = match.group(1).strip()
                # Remove trailing noise
                nomor = re.split(r"\s{2,}|\t", nomor)[0].strip()
                if len(nomor) >= 4:
                    return nomor
        return None

    # ──────────────────────
    # Perihal / Hal
    # ──────────────────────
    def extract_perihal(self, text: str) -> Optional[str]:
        """
        Extract perihal (subject) from official letter.
        Patterns: 'Perihal :' or 'Hal :'
        """
        patterns = [
            r"(?:Perihal|Hal)\s*[:\.]?\s*(.+?)(?=\n\n|\n[A-Z]|$)",
            r"(?:Perihal|Hal)\s*[:\.]?\s*([^\n\r]{5,200})",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                perihal = match.group(1).strip()
                # Take only the first line if multiline
                perihal = perihal.split("\n")[0].strip()
                # Clean extra whitespace
                perihal = re.sub(r"\s+", " ", perihal)
                if len(perihal) >= 5:
                    return perihal
        return None

    # ──────────────────────
    # Tanggal Surat
    # ──────────────────────
    def extract_tanggal_surat(self, text: str) -> Optional[date]:
        """
        Extract tanggal surat. Supports:
          - DD Januari YYYY
          - DD/MM/YYYY  or  DD-MM-YYYY
          - Kota, DD Bulan YYYY  (trailing date in letter header)
        """
        # Pattern 1: "15 Januari 2025" or "15 januari 2025"
        match = re.search(
            r"\b(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|"
            r"Jan|Feb|Mar|Apr|Jun|Jul|Agt|Ags|Sep|Okt|Nov|Des)\s+(\d{4})\b",
            text,
            re.IGNORECASE,
        )
        if match:
            day = int(match.group(1))
            month = BULAN_MAP.get(match.group(2).lower())
            year = int(match.group(3))
            if month and 1 <= day <= 31 and 2000 <= year <= 2099:
                try:
                    return date(year, month, day)
                except ValueError:
                    pass

        # Pattern 2: DD/MM/YYYY or DD-MM-YYYY
        match = re.search(r"\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b", text)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if 1 <= day <= 31 and 1 <= month <= 12 and 2000 <= year <= 2099:
                try:
                    return date(year, month, day)
                except ValueError:
                    pass

        return None

    # ──────────────────────
    # Pengirim (Sender)
    # ──────────────────────
    def extract_pengirim(self, text: str) -> Optional[str]:
        """
        Extract sender organization. Heuristics:
        1. Text right after "KEPOLISIAN" / "PEMERINTAH" / "KEMENTERIAN" / "BADAN" at top of letter
        2. After "Yang bertanda tangan" block → "a.n." / "atas nama" line
        3. Organization name in first 10 lines (if all-caps line)
        """
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        # Heuristic 1: Known Indonesian org prefixes in first 15 lines
        org_prefixes = (
            "KEPOLISIAN", "POLDA", "POLRES", "POLRESTA",
            "KEMENTERIAN", "PEMERINTAH", "BADAN", "LEMBAGA",
            "DIREKTORAT", "SATUAN", "DINAS", "KOMISI",
        )
        for line in lines[:15]:
            upper = line.upper()
            if any(upper.startswith(pfx) for pfx in org_prefixes):
                return line.strip()

        # Heuristic 2: Look for "Kepala" / "Direktur" signature block
        match = re.search(
            r"(?:Kepala|Direktur|Kapolda|Kapolres|Kabid)\s+(.+?)(?:\n|,)",
            text, re.IGNORECASE
        )
        if match:
            return match.group(0).strip()

        # Heuristic 3: First ALL_CAPS line
        for line in lines[:10]:
            if line.isupper() and len(line) > 8:
                return line

        return None

    # ──────────────────────
    # Master extract
    # ──────────────────────
    def extract_all(self, text: str) -> Dict[str, Any]:
        """
        Run all extractors and return a structured result with per-field confidence.

        Returns:
            {
                "nomor_surat":  { "value": str | None, "detected": bool },
                "perihal":      { "value": str | None, "detected": bool },
                "tanggal_surat":{ "value": str | None, "detected": bool },  # ISO date string
                "pengirim":     { "value": str | None, "detected": bool },
            }
        """
        nomor = self.extract_nomor_surat(text)
        perihal = self.extract_perihal(text)
        tanggal = self.extract_tanggal_surat(text)
        pengirim = self.extract_pengirim(text)

        return {
            "nomor_surat": {
                "value": nomor,
                "detected": nomor is not None,
            },
            "perihal": {
                "value": perihal,
                "detected": perihal is not None,
            },
            "tanggal_surat": {
                "value": tanggal.isoformat() if tanggal else None,
                "detected": tanggal is not None,
            },
            "pengirim": {
                "value": pengirim,
                "detected": pengirim is not None,
            },
        }


# Singleton
extraction_service = ExtractionService()

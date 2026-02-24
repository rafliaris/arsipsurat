"""
Extraction Service — SuratResmiDetector
Parses OCR text from Indonesian official letters (surat dinas/resmi) to extract
structured fields using block-based detection + targeted regex patterns.

Based on: ocr-docs.md  (SuratResmiDetector architecture)
"""
import re
from dataclasses import dataclass, asdict
from datetime import date
from typing import Optional, Dict, Any


# ─────────────────────────────────────────────────────────────────────────────
# Indonesian month → int
# ─────────────────────────────────────────────────────────────────────────────
BULAN_MAP = {
    "januari": 1,  "februari": 2,  "maret": 3,   "april": 4,
    "mei": 5,      "juni": 6,      "juli": 7,    "agustus": 8,
    "september": 9,"oktober": 10,  "november": 11,"desember": 12,
    # Abbreviations
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "jun": 6, "jul": 7, "agt": 8, "ags": 8,
    "sep": 9, "okt": 10,"nov": 11, "des": 12,
}

BULAN_PATTERN = (
    r"Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus"
    r"|September|Oktober|November|Desember"
    r"|Jan|Feb|Mar|Apr|Jun|Jul|Agt|Ags|Sep|Okt|Nov|Des"
)


@dataclass
class SuratResult:
    nomor_surat:    Optional[str] = None
    tanggal_surat:  Optional[str] = None  # ISO date string YYYY-MM-DD
    pengirim:       Optional[str] = None
    penerima:       Optional[str] = None
    jabatan_penerima: Optional[str] = None
    perihal:        Optional[str] = None
    isi_singkat:    Optional[str] = None


class ExtractionService:
    """
    Extracts structured fields from OCR text of Indonesian official letters.
    All methods are non-fatal — they return None if a field cannot be detected.
    """

    # ─── Regex patterns ──────────────────────────────────────────
    NOMOR_PATTERNS = [
        r"(?:Nomor\s*Surat|Nomor|No\.?)\s*[:\.\-]?\s*([A-Z0-9][A-Z0-9\/\.\-]{2,60})",
    ]

    PERIHAL_PATTERNS = [
        # Multi-line perihal — stops at blank line or next heading
        r"(?:Perihal|Hal)\s*[:\.]?\s*(.+?)(?=\n\s*\n|\n[A-Z][a-z]|\Z)",
        # Single-line fallback
        r"(?:Perihal|Hal)\s*[:\.]?\s*([^\n\r]{5,200})",
    ]

    ISI_START_KEYWORDS = [
        "Dengan hormat", "Sehubungan dengan", "Bersama ini kami",
        "Dalam rangka", "Menindaklanjuti", "Memperhatikan",
        "Berkenaan dengan", "Bersama surat ini",
    ]
    ISI_END_KEYWORDS = [
        "Demikian", "Atas perhatian", "Wassalamu", "Hormat kami",
        "Atas kerja sama", "Atas perkenan",
    ]

    ORG_PREFIXES = (
        "KEPOLISIAN", "POLDA", "POLRES", "POLRESTA", "POLSEK",
        "KEMENTERIAN", "PEMERINTAH", "BADAN", "LEMBAGA",
        "DIREKTORAT", "SATUAN", "DINAS", "KOMISI", "MABES",
    )

    # ─────────────────────────────────────────────────────────────
    # Public
    # ─────────────────────────────────────────────────────────────

    def extract_all(self, text: str) -> Dict[str, Any]:
        """
        Run all extractors and return per-field results.

        Returns:
            {
                "nomor_surat":   { "value": str | None, "detected": bool },
                "perihal":       { "value": str | None, "detected": bool },
                "tanggal_surat": { "value": str | None, "detected": bool },
                "pengirim":      { "value": str | None, "detected": bool },
                "penerima":      { "value": str | None, "detected": bool },
                "isi_singkat":   { "value": str | None, "detected": bool },
            }
        """
        if not text:
            return self._empty_result()

        # Normalise line endings
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        result = SuratResult(
            nomor_surat   = self._extract_nomor(text),
            tanggal_surat = self._extract_tanggal(text),
            pengirim      = self._extract_pengirim(text),
            perihal       = self._extract_perihal(text),
            isi_singkat   = self._extract_isi(text),
        )
        # Penerima extraction (block-based)
        penerima_data = self._extract_penerima_block(text)
        result.penerima = penerima_data.get("nama")
        result.jabatan_penerima = penerima_data.get("jabatan")

        return {
            "nomor_surat":   {"value": result.nomor_surat,   "detected": result.nomor_surat   is not None},
            "perihal":       {"value": result.perihal,       "detected": result.perihal       is not None},
            "tanggal_surat": {"value": result.tanggal_surat, "detected": result.tanggal_surat is not None},
            "pengirim":      {"value": result.pengirim,      "detected": result.pengirim      is not None},
            "penerima":      {"value": result.penerima,      "detected": result.penerima      is not None},
            "isi_singkat":   {"value": result.isi_singkat,   "detected": result.isi_singkat   is not None},
        }

    # ─────────────────────────────────────────────────────────────
    # Nomor Surat
    # ─────────────────────────────────────────────────────────────

    def _extract_nomor(self, text: str) -> Optional[str]:
        for pattern in self.NOMOR_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                nomor = m.group(1).strip()
                # Stop at whitespace run / tab / common trailing words
                nomor = re.split(r"\s{2,}|\t|\n", nomor)[0].strip()
                # Must look like a real nomor: contains / or - and is reasonable length
                if len(nomor) >= 4 and re.search(r"[/\-]", nomor):
                    return nomor
        return None

    # ─────────────────────────────────────────────────────────────
    # Tanggal Surat
    # ─────────────────────────────────────────────────────────────

    def _extract_tanggal(self, text: str) -> Optional[str]:
        # Pattern 1: "15 Januari 2025" — full month name or abbreviation
        m = re.search(
            rf"\b(\d{{1,2}})\s+({BULAN_PATTERN})\s+(\d{{4}})\b",
            text, re.IGNORECASE,
        )
        if m:
            day, bulan_str, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
            month = BULAN_MAP.get(bulan_str)
            if month and 1 <= day <= 31 and 2000 <= year <= 2099:
                try:
                    return date(year, month, day).isoformat()
                except ValueError:
                    pass

        # Pattern 2: "Kota, 15 Januari 2025" — city prefix (header trailing date)
        m = re.search(
            rf"[A-Za-z]+\s*,\s*(\d{{1,2}})\s+({BULAN_PATTERN})\s+(\d{{4}})",
            text, re.IGNORECASE,
        )
        if m:
            day, bulan_str, year = int(m.group(1)), m.group(2).lower(), int(m.group(3))
            month = BULAN_MAP.get(bulan_str)
            if month and 1 <= day <= 31 and 2000 <= year <= 2099:
                try:
                    return date(year, month, day).isoformat()
                except ValueError:
                    pass

        # Pattern 3: DD/MM/YYYY or DD-MM-YYYY
        m = re.search(r"\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b", text)
        if m:
            day, month, year = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= day <= 31 and 1 <= month <= 12 and 2000 <= year <= 2099:
                try:
                    return date(year, month, day).isoformat()
                except ValueError:
                    pass

        return None

    # ─────────────────────────────────────────────────────────────
    # Pengirim (Sender — usually the issuing organisation)
    # ─────────────────────────────────────────────────────────────

    def _extract_pengirim(self, text: str) -> Optional[str]:
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        # Heuristic 1: Known Indonesian org prefixes in first 15 lines
        for line in lines[:15]:
            if any(line.upper().startswith(pfx) for pfx in self.ORG_PREFIXES):
                return line.strip()

        # Heuristic 2: Signature block — text after "Hormat kami" / "Wassalamu"
        block_m = re.search(
            r"(?:Hormat\s+(?:kami|saya)|Wassalamu[^,]*,)\s*\n(.*?)$",
            text, re.IGNORECASE | re.DOTALL,
        )
        if block_m:
            block_lines = [l.strip() for l in block_m.group(1).split("\n") if l.strip()]
            for i, line in enumerate(block_lines):
                # Name: ALL-CAPS, 5+ chars
                if re.match(r"^[A-Z][A-Z\s\.]+$", line) and len(line) > 5:
                    return line

        # Heuristic 3: First all-caps line in first 10 lines
        for line in lines[:10]:
            if line.isupper() and len(line) > 8:
                return line

        return None

    # ─────────────────────────────────────────────────────────────
    # Penerima (Recipient — block-based)
    # ─────────────────────────────────────────────────────────────

    def _extract_penerima_block(self, text: str) -> dict:
        """
        Find the 'Kepada Yth.' block and extract name + jabatan from the lines below it.
        Stops at 'di ' line, 'Perihal', 'Hal', blank line, or 'Dengan hormat'.
        """
        result: dict = {}

        STOP_PATTERN = re.compile(
            r"^\s*(di\s+\w|Perihal|Hal\s*:|Dengan\s+hormat|Tempat\s*$)",
            re.IGNORECASE,
        )

        # Find block start
        block_m = re.search(
            r"(Kepada\s*(?:\n\s*)?(?:Yth\.?|Yang\s+Terhormat)?.*?)(?=\n\s*(?:di\s+|Perihal|Hal\s*:|Dengan\s+hormat))",
            text, re.IGNORECASE | re.DOTALL,
        )
        if block_m:
            block = block_m.group(1)
            raw_lines = block.split("\n")
            # Filter out the 'Kepada / Yth.' header lines themselves
            lines = []
            for l in raw_lines:
                ls = l.strip()
                if not ls:
                    continue
                if re.match(r"^(Kepada|Yth\.?|Yang\s+Terhormat)$", ls, re.IGNORECASE):
                    continue
                if STOP_PATTERN.match(ls):
                    break
                lines.append(ls)

            if lines:
                # Remove honorific prefix
                nama = re.sub(r"^(Bapak|Ibu|Bapak/Ibu|Sdr\.?|Yth\.?)\s+", "", lines[0], flags=re.IGNORECASE).strip()
                result["nama"] = nama
            if len(lines) > 1:
                result["jabatan"] = lines[1]
            if len(lines) > 2:
                result["alamat"] = " ".join(lines[2:])
        else:
            # Simple fallback: one-liner pattern
            m = re.search(
                r"(?:Kepada\s+(?:Yth\.?)?|Yth\.?)\s*[:\.]?\s*(?:Bapak/Ibu\s*)?([^\n]+)",
                text, re.IGNORECASE,
            )
            if m:
                result["nama"] = m.group(1).strip()

        return result

    # ─────────────────────────────────────────────────────────────
    # Perihal / Subject
    # ─────────────────────────────────────────────────────────────

    def _extract_perihal(self, text: str) -> Optional[str]:
        for pattern in self.PERIHAL_PATTERNS:
            m = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if m:
                perihal = m.group(1).strip()
                # Take only first meaningful line(s)
                lines = [l.strip() for l in perihal.split("\n") if l.strip()]
                if not lines:
                    continue
                # Join if second line looks like continuation (lowercase start / no colon)
                result = lines[0]
                if len(lines) > 1 and lines[1] and lines[1][0].islower():
                    result = result + " " + lines[1]
                result = re.sub(r"\s+", " ", result).strip()
                if len(result) >= 5:
                    return result
        return None

    # ─────────────────────────────────────────────────────────────
    # Isi Singkat (Body summary — first paragraph of letter body)
    # ─────────────────────────────────────────────────────────────

    def _extract_isi(self, text: str) -> Optional[str]:
        start_idx: Optional[int] = None
        end_idx: Optional[int] = None

        for kw in self.ISI_START_KEYWORDS:
            idx = text.find(kw)
            if idx != -1:
                start_idx = idx
                break

        for kw in self.ISI_END_KEYWORDS:
            idx = text.find(kw)
            if idx != -1 and (end_idx is None or idx < end_idx):
                end_idx = idx

        if start_idx is not None and end_idx is not None and start_idx < end_idx:
            isi = text[start_idx:end_idx].strip()
            # Limit to ~300 chars for isi_singkat
            if len(isi) > 300:
                isi = isi[:300].rsplit(" ", 1)[0] + "…"
            return isi if len(isi) >= 20 else None
        return None

    # ─────────────────────────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────────────────────────

    def _empty_result(self) -> Dict[str, Any]:
        fields = ["nomor_surat", "perihal", "tanggal_surat", "pengirim", "penerima", "isi_singkat"]
        return {f: {"value": None, "detected": False} for f in fields}


# Singleton
extraction_service = ExtractionService()

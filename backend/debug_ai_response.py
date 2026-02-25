"""
Debug script: dump the full raw OpenRouter API request & response.
Run from the backend/ directory:
    python debug_ai_response.py [path/to/file.pdf]

If no file is given, sends OCR text only.
"""
import base64
import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL   = os.getenv("OPENROUTER_MODEL", "z-ai/glm-4.5-air:free")
API_URL = "https://openrouter.ai/api/v1/chat/completions"

if not API_KEY:
    print("ERROR: OPENROUTER_API_KEY not set in .env")
    sys.exit(1)

print(f"Model  : {MODEL}")
print(f"API URL: {API_URL}")
print("-" * 60)

SYSTEM_PROMPT = (
    "Anda adalah sistem ekstraksi data dari surat resmi Indonesia.\n"
    "Balas HANYA dengan JSON valid:\n"
    '{"nomor_surat":"...","tanggal_surat":"...","pengirim":"...",'
    '"penerima":"...","perihal":"...","isi_singkat":"..."}'
)

# ── Build user content ────────────────────────────────────────────
file_path = sys.argv[1] if len(sys.argv) > 1 else None
user_content = None
plugins = None

if file_path:
    path = Path(file_path)
    if not path.exists():
        print(f"ERROR: file not found: {file_path}")
        sys.exit(1)

    file_bytes = path.read_bytes()
    b64 = base64.b64encode(file_bytes).decode()
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        data_url = f"data:application/pdf;base64,{b64}"
        user_content = [
            {"type": "text",  "text": "Ekstrak informasi dari surat berikut. Kembalikan HANYA JSON."},
            {"type": "file",  "file": {"filename": path.name, "file_data": data_url}},
        ]
        plugins = [{"id": "file-parser", "pdf": {"engine": "pdf-text"}}]
        print(f"Sending PDF via file API ({len(file_bytes)//1024} KB)")
    elif suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        mime = {"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","webp":"image/webp"}.get(suffix[1:], "image/png")
        user_content = [
            {"type": "text",      "text": "Ekstrak informasi dari gambar surat. Kembalikan HANYA JSON."},
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
        ]
        print(f"Sending image via image_url ({len(file_bytes)//1024} KB)")
    else:
        print(f"Unsupported file type: {suffix}")
        sys.exit(1)
else:
    # OCR text fallback
    sample_text = (
        "KEPOLISIAN NEGARA REPUBLIK INDONESIA\n"
        "DAERAH NUSA TENGGARA BARAT\n\n"
        "Nomor   : B/001/I/2025\n"
        "Tanggal : 10 Januari 2025\n"
        "Kepada  : Yth. Kabag Ops\n"
        "Perihal : Undangan Rapat Koordinasi\n\n"
        "Dengan hormat, bersama ini kami mengundang Bapak/Ibu untuk hadir dalam rapat koordinasi..."
    )
    user_content = (
        "Ekstrak informasi dari teks OCR surat berikut:\n\n"
        f"---\n{sample_text}\n---\n\n"
        "Kembalikan HANYA JSON, tidak ada teks lain."
    )
    print("No file given — using sample OCR text")

print("-" * 60)

# ── Build payload ─────────────────────────────────────────────────
payload = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_content},
    ],
    "temperature": 0.1,
    "max_tokens": 2048,
}
if plugins:
    payload["plugins"] = plugins

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:8000",
    "X-Title": "Arsip Surat Debug",
}

# Print request summary (not the full base64)
payload_display = dict(payload)
if isinstance(user_content, list):
    payload_display["messages"][1]["content"] = "[multipart content — file omitted from display]"
print("REQUEST PAYLOAD (summary):")
print(json.dumps({k: v for k, v in payload.items() if k != "messages"}, indent=2))
print()

# ── Send request ──────────────────────────────────────────────────
print("Sending request (timeout=90s)...")
try:
    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=90)
except requests.exceptions.Timeout:
    print("ERROR: Request timed out after 90s")
    sys.exit(1)

print(f"\nHTTP Status: {resp.status_code}")
print("-" * 60)

# ── Full raw response ─────────────────────────────────────────────
print("FULL RAW RESPONSE:")
try:
    data = resp.json()
    print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception:
    print("(non-JSON response body:)")
    print(resp.text)

print("-" * 60)

# ── Parse & show result ───────────────────────────────────────────
if resp.ok:
    try:
        message  = data["choices"][0]["message"]
        content  = message.get("content") or ""
        reasoning = message.get("reasoning") or ""

        print(f"\ncontent  field ({len(content)} chars):   {repr(content[:300])}")
        print(f"reasoning field ({len(reasoning)} chars): {repr(reasoning[:300])}")

        active = content.strip() or reasoning.strip()
        if not active:
            print("\nBOTH FIELDS EMPTY — model returned nothing useful")
        else:
            text = content if content.strip() else reasoning
            start = text.find("{")
            end   = text.rfind("}") + 1
            if start != -1 and end > 0:
                parsed = json.loads(text[start:end])
                print("\nPARSED JSON:")
                print(json.dumps(parsed, indent=2, ensure_ascii=False))
            else:
                print("\nNo JSON found in response. Raw text:")
                print(text[:500])
    except Exception as e:
        print(f"\nParse error: {e}")

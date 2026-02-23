"""
Dummy Data Seeder for Arsip Surat System
Generates realistic test data for all tables

Usage:
    python seed_dummy_data.py              # Insert all dummy data
    python seed_dummy_data.py --clear      # Clear existing data first, then insert
    python seed_dummy_data.py --clear-only # Only clear data, no insert
"""
import sys
import os
import random
from datetime import datetime, date, timedelta

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.models.kategori import Kategori
from app.models.surat_masuk import SuratMasuk, StatusSurat, PrioritySurat
from app.models.surat_keluar import SuratKeluar
from app.models.disposisi import Disposisi, StatusDisposisi
from app.models.notifikasi import Notifikasi, TipeNotifikasi
from app.core.security import get_password_hash


# ─────────────────────────────────────────────────────────────
# DUMMY DATA DEFINITIONS
# ─────────────────────────────────────────────────────────────

USERS = [
    {"username": "budi.santoso",   "email": "budi.santoso@polda.go.id",   "full_name": "Budi Santoso",       "role": "admin",  "password": "password123"},
    {"username": "siti.rahayu",    "email": "siti.rahayu@polda.go.id",    "full_name": "Siti Rahayu",        "role": "staff",  "password": "password123"},
    {"username": "ahmad.fauzi",    "email": "ahmad.fauzi@polda.go.id",    "full_name": "Ahmad Fauzi",        "role": "staff",  "password": "password123"},
    {"username": "dewi.kusuma",    "email": "dewi.kusuma@polda.go.id",    "full_name": "Dewi Kusuma",        "role": "staff",  "password": "password123"},
    {"username": "rudi.hartono",   "email": "rudi.hartono@polda.go.id",   "full_name": "Rudi Hartono",       "role": "viewer", "password": "password123"},
]

PENGIRIM_LIST = [
    "Kepolisian Daerah Jawa Barat",
    "Kementerian Dalam Negeri RI",
    "Badan Nasional Penanggulangan Bencana",
    "Komisi Pemberantasan Korupsi",
    "Badan Intelijen Negara",
    "Kementerian Hukum dan HAM RI",
    "Kejaksaan Agung RI",
    "Mahkamah Agung RI",
    "Badan Siber dan Sandi Negara",
    "Kepolisian Resort Kota Bandung",
    "Pemerintah Provinsi Jawa Barat",
    "Dinas Sosial Kota Bandung",
    "Badan Kepegawaian Negara",
    "Lembaga Perlindungan Saksi dan Korban",
    "Komnas HAM",
]

PENERIMA_LIST = [
    "Kepolisian Resort Kota Bandung",
    "Satuan Lalu Lintas Polda Jabar",
    "Direktorat Kriminal Umum",
    "Direktorat Kriminal Khusus",
    "Satuan Reserse Mobile",
    "Satuan Sabhara",
    "Bidang Humas Polda Jabar",
    "Kepala Bagian Operasional",
    "Direktorat Lalu Lintas",
    "Satuan Narkoba",
]

PERIHAL_MASUK = [
    "Undangan Rapat Koordinasi Keamanan Nasional",
    "Permohonan Data Kriminalitas Tahun 2025",
    "Laporan Situasi Keamanan Triwulan IV",
    "Pemberitahuan Mutasi Personel",
    "Permintaan Bantuan Pengamanan Kegiatan",
    "Surat Tugas Penyelidikan Kasus",
    "Edaran Kebijakan Penggunaan Senjata Api",
    "Laporan Penanganan Bencana Alam",
    "Permohonan Rekomendasi Izin Keramaian",
    "Pemberitahuan Kunjungan Kerja Pimpinan",
    "Pengaduan Masyarakat Terkait Keamanan",
    "Permintaan Data Aset Kepolisian",
    "Undangan Pelatihan SDM Polri",
    "Laporan Penyelesaian Perkara",
    "Permohonan Izin Penelitian di Lingkungan Polda",
    "Instruksi Pengamanan Hari Raya",
    "Permohonan Perpanjangan Izin Senjata Api",
    "Koordinasi Penegakan Hukum Lintas Wilayah",
    "Surat Keterangan Catatan Kepolisian",
    "Edaran Protokol Penanganan COVID-19",
]

PERIHAL_KELUAR = [
    "Jawaban atas Permohonan Data Kriminalitas",
    "Surat Tugas Tim Investigasi",
    "Rekomendasi Izin Keramaian Acara",
    "Laporan Bulanan Situasi Kamtibmas",
    "Pemberitahuan Pelaksanaan Razia",
    "Surat Keterangan Mahasiswa Riset",
    "Undangan Apel Kesiapan Operasi",
    "Laporan Hasil Penyelidikan",
    "Surat Pernyataan Kerja Sama",
    "Pemberitahuan Rotasi Jabatan",
    "Nota Dinas Penganggaran Operasional",
    "Konfirmasi Kehadiran Rapat",
    "Laporan Kegiatan Patroli",
    "Surat Izin Meninggalkan Daerah",
    "Rekomendasi Kenaikan Pangkat",
]

ISI_SINGKAT_TEMPLATES = [
    "Surat ini berisi informasi mengenai {} yang perlu segera ditindaklanjuti oleh pihak terkait.",
    "Bersama surat ini kami sampaikan perihal {} untuk menjadi perhatian dan tindak lanjut.",
    "Dalam rangka {} kami mengundang perwakilan instansi untuk hadir pada pertemuan yang dimaksud.",
    "Sehubungan dengan {} dimohon agar segera memberikan tanggapan dalam waktu 3 hari kerja.",
    "Dengan hormat, kami sampaikan {} sebagai bagian dari koordinasi antar instansi.",
]

INSTRUKSI_DISPOSISI = [
    "Harap segera ditindaklanjuti dan dilaporkan hasilnya.",
    "Untuk diproses sesuai prosedur yang berlaku.",
    "Harap dipelajari dan berikan masukan dalam rapat berikutnya.",
    "Koordinasikan dengan bagian terkait dan buat laporan.",
    "Segera buat surat balasan dan lampirkan data pendukung.",
    "Tindak lanjuti sesuai petunjuk dan laporkan perkembangan.",
    "Arsipkan setelah diproses dan beri tanda terima.",
    "Koordinasikan dengan instansi terkait untuk penyelesaian.",
]


# ─────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────

def random_date(start_days_ago: int = 365, end_days_ago: int = 0) -> date:
    """Generate a random date between start and end days ago"""
    start = date.today() - timedelta(days=start_days_ago)
    end = date.today() - timedelta(days=end_days_ago)
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))

def random_datetime(start_days_ago: int = 365, end_days_ago: int = 0) -> datetime:
    """Generate a random datetime"""
    d = random_date(start_days_ago, end_days_ago)
    hour = random.randint(7, 17)
    minute = random.randint(0, 59)
    return datetime(d.year, d.month, d.day, hour, minute)

def generate_nomor_surat_masuk(idx: int, year: int = 2025) -> str:
    """Generate formatted surat masuk number"""
    origins = ["B", "S", "SPT", "UND", "LAP"]
    return f"{random.choice(origins)}/{idx:04d}/{random.randint(1,12):02d}/{year}"

def generate_nomor_surat_keluar(idx: int, year: int = 2025) -> str:
    """Generate formatted surat keluar number"""
    return f"B/{idx:04d}/XII/{year}/POLDA"

def generate_isi_singkat(perihal: str) -> str:
    template = random.choice(ISI_SINGKAT_TEMPLATES)
    return template.format(perihal.lower())


# ─────────────────────────────────────────────────────────────
# SEEDER FUNCTIONS
# ─────────────────────────────────────────────────────────────

def seed_users(db, existing_usernames: set) -> list:
    """Seed additional staff users"""
    users = []
    print("\n👥 Seeding users...")
    for u in USERS:
        if u["username"] in existing_usernames:
            print(f"   ⏭️  Skipping {u['username']} (already exists)")
            # Still fetch for use in seeding
            existing = db.query(User).filter(User.username == u["username"]).first()
            if existing:
                users.append(existing)
            continue
        user = User(
            username=u["username"],
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            hashed_password=get_password_hash(u["password"]),
            is_active=True,
        )
        db.add(user)
        users.append(user)
        print(f"   ✅ Created user: {u['username']} ({u['role']})")
    db.flush()  # flush to get IDs
    return users


def seed_surat_masuk(db, kategori_list: list, user_list: list, count: int = 40) -> list:
    """Seed incoming mail records"""
    print(f"\n📥 Seeding {count} surat masuk...")
    records = []
    for i in range(1, count + 1):
        created_dt = random_datetime(365, 0)
        surat_date = created_dt.date() - timedelta(days=random.randint(1, 14))
        receive_date = surat_date + timedelta(days=random.randint(1, 5))
        user = random.choice(user_list)
        kategori = random.choice(kategori_list) if kategori_list else None

        perihal = random.choice(PERIHAL_MASUK)
        sm = SuratMasuk(
            nomor_surat=generate_nomor_surat_masuk(i, created_dt.year),
            tanggal_surat=surat_date,
            tanggal_terima=receive_date,
            pengirim=random.choice(PENGIRIM_LIST),
            perihal=perihal,
            isi_singkat=generate_isi_singkat(perihal),
            kategori_id=kategori.id if kategori else None,
            file_path=f"storage/surat_masuk/dummy_doc_{i:04d}.pdf",
            file_type="application/pdf",
            file_size=random.randint(50_000, 2_000_000),
            original_filename=f"surat_masuk_{i:04d}.pdf",
            ocr_text=f"Teks OCR untuk surat dengan perihal: {perihal}. Isi surat ini merupakan data dummy untuk keperluan pengujian sistem.",
            ocr_confidence=round(random.uniform(75.0, 99.0), 2),
            keywords=random.sample(["keamanan", "koordinasi", "laporan", "tugas", "undangan", "data", "polda", "nasional"], k=random.randint(2, 5)),
            status=random.choice(list(StatusSurat)),
            priority=random.choice(list(PrioritySurat)),
            created_by=user.id,
            created_at=created_dt,
        )
        db.add(sm)
        records.append(sm)
    db.flush()
    print(f"   ✅ Created {count} surat masuk records")
    return records


def seed_surat_keluar(db, kategori_list: list, user_list: list, count: int = 30) -> list:
    """Seed outgoing mail records"""
    print(f"\n📤 Seeding {count} surat keluar...")
    records = []
    for i in range(1, count + 1):
        created_dt = random_datetime(365, 0)
        user = random.choice(user_list)
        kategori = random.choice(kategori_list) if kategori_list else None

        perihal = random.choice(PERIHAL_KELUAR)
        sk = SuratKeluar(
            nomor_surat_keluar=generate_nomor_surat_keluar(i, created_dt.year),
            tanggal_surat=created_dt.date(),
            penerima=random.choice(PENERIMA_LIST),
            tembusan=f"{random.choice(PENERIMA_LIST)}, {random.choice(PENERIMA_LIST)}",
            perihal=perihal,
            isi_singkat=generate_isi_singkat(perihal),
            kategori_id=kategori.id if kategori else None,
            file_path=f"storage/surat_keluar/dummy_doc_{i:04d}.pdf",
            file_type="application/pdf",
            file_size=random.randint(50_000, 1_500_000),
            original_filename=f"surat_keluar_{i:04d}.pdf",
            status=random.choice(list(StatusSurat)),
            priority=random.choice(list(PrioritySurat)),
            created_by=user.id,
            created_at=created_dt,
        )
        db.add(sk)
        records.append(sk)
    db.flush()
    print(f"   ✅ Created {count} surat keluar records")
    return records


def seed_disposisi(db, surat_masuk_list: list, user_list: list, count: int = 25) -> list:
    """Seed disposisi (letter routing) records"""
    print(f"\n🔀 Seeding {count} disposisi...")
    records = []
    statuses = list(StatusDisposisi)
    # Weighted: more pending/ditindaklanjuti than selesai
    status_weights = [0.3, 0.35, 0.25, 0.10]

    for i in range(count):
        surat = random.choice(surat_masuk_list)
        users_sample = random.sample(user_list, 2)
        from_user = users_sample[0]
        to_user = users_sample[1]
        status = random.choices(statuses, weights=status_weights, k=1)[0]
        created_dt = random_datetime(180, 0)
        deadline = (created_dt + timedelta(days=random.randint(3, 30))).date()

        tanggal_selesai = None
        keterangan_selesai = None
        if status == StatusDisposisi.SELESAI:
            tanggal_selesai = datetime(created_dt.year, created_dt.month, created_dt.day) + timedelta(days=random.randint(1, 14))
            keterangan_selesai = "Telah ditindaklanjuti sesuai instruksi dan hasilnya dilaporkan."

        d = Disposisi(
            surat_masuk_id=surat.id,
            from_user_id=from_user.id,
            to_user_id=to_user.id,
            catatan=random.choice(INSTRUKSI_DISPOSISI),
            instruksi=random.choice(INSTRUKSI_DISPOSISI),
            batas_waktu=deadline,
            status=status,
            tanggal_selesai=tanggal_selesai,
            keterangan_selesai=keterangan_selesai,
            created_at=created_dt,
        )
        db.add(d)
        records.append(d)
    db.flush()
    print(f"   ✅ Created {count} disposisi records")
    return records


def seed_notifikasi(db, user_list: list, surat_masuk_list: list, disposisi_list: list, count: int = 30):
    """Seed notification records"""
    print(f"\n🔔 Seeding {count} notifikasi...")
    tipe_list = list(TipeNotifikasi)

    for i in range(count):
        user = random.choice(user_list)
        tipe = random.choice(tipe_list)
        is_read = random.choice([True, False, False])  # Most unread

        if disposisi_list and random.random() > 0.5:
            disp = random.choice(disposisi_list)
            judul = "Disposisi baru"
            pesan = "Anda menerima disposisi baru yang perlu ditindaklanjuti segera."
            n = Notifikasi(
                user_id=user.id,
                tipe=tipe,
                judul=judul,
                pesan=pesan,
                is_read=is_read,
                disposisi_id=disp.id,
                created_at=random_datetime(60, 0),
            )
        else:
            surat = random.choice(surat_masuk_list)
            judul = "Surat masuk baru"
            pesan = f"Ada surat masuk baru dengan perihal: {surat.perihal[:80]}."
            n = Notifikasi(
                user_id=user.id,
                tipe=tipe,
                judul=judul,
                pesan=pesan,
                is_read=is_read,
                surat_masuk_id=surat.id,
                created_at=random_datetime(60, 0),
            )
        db.add(n)
    db.flush()
    print(f"   ✅ Created {count} notifikasi records")



def clear_dummy_data(db):
    """Clear all data from the main tables (keeps admin user and categories/settings)"""
    print("\n🗑️  Clearing existing data...")
    db.query(Notifikasi).delete()
    db.query(Disposisi).delete()
    db.query(SuratKeluar).delete()
    db.query(SuratMasuk).delete()
    # Remove dummy users (keep admin)
    db.query(User).filter(User.username.in_([u["username"] for u in USERS])).delete(synchronize_session=False)
    db.commit()
    print("   ✅ Cleared notifikasi, disposisi, surat_masuk, surat_keluar, dummy users")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    should_clear = "--clear" in args
    clear_only = "--clear-only" in args

    db = SessionLocal()
    try:
        print("=" * 60)
        print("🌱 Arsip Surat - Dummy Data Seeder")
        print("=" * 60)

        if should_clear or clear_only:
            clear_dummy_data(db)
            if clear_only:
                print("\n✅ Done! Data cleared.")
                return

        # Load existing data
        existing_users = db.query(User).filter(User.deleted_at == None).all()
        existing_usernames = {u.username for u in existing_users}

        kategori_list = db.query(Kategori).filter(
            Kategori.is_active == True,
            Kategori.deleted_at == None
        ).all()

        if not kategori_list:
            print("⚠️  No categories found! Run migrations first: alembic upgrade head")
            return

        print(f"\n📁 Found {len(kategori_list)} categories")
        print(f"👤 Found {len(existing_users)} existing users")

        # Seed in order
        all_users = seed_users(db, existing_usernames)
        if not all_users:
            all_users = existing_users

        surat_masuk_list = seed_surat_masuk(db, kategori_list, all_users, count=40)
        surat_keluar_list = seed_surat_keluar(db, kategori_list, all_users, count=30)
        disposisi_list = seed_disposisi(db, surat_masuk_list, all_users, count=25)
        seed_notifikasi(db, all_users, surat_masuk_list, disposisi_list, count=35)

        # Final commit
        db.commit()

        print("\n" + "=" * 60)
        print("✅ Dummy data seeded successfully!")
        print(f"   👥 Users:       {len(USERS)} new staff users")
        print(f"   📥 Surat Masuk: 40 records")
        print(f"   📤 Surat Keluar: 30 records")
        print(f"   🔀 Disposisi:   25 records")
        print(f"   🔔 Notifikasi:  35 records")
        print("\n📋 Staff Login Credentials:")
        print("   Username: budi.santoso  | Password: password123  (admin)")
        print("   Username: siti.rahayu   | Password: password123  (staff)")
        print("   Username: ahmad.fauzi   | Password: password123  (staff)")
        print("   Username: dewi.kusuma   | Password: password123  (staff)")
        print("   Username: rudi.hartono  | Password: password123  (viewer)")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

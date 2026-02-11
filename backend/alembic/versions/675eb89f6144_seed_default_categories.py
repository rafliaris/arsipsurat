"""seed default categories

Revision ID: 675eb89f6144
Revises: b1a930a69e0b
Create Date: 2026-02-11 10:44:12.246510

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '675eb89f6144'
down_revision = 'b1a930a69e0b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Insert default categories
    op.execute("""
        INSERT INTO kategori (nama, kode, deskripsi, color, is_active, created_at, updated_at)
        VALUES
            ('Undangan', 'UND', 'Surat undangan rapat, acara, dll', '#8B5CF6', 1, NOW(), NOW()),
            ('Pengumuman', 'PNG', 'Pengumuman resmi', '#EC4899', 1, NOW(), NOW()),
            ('Permohonan', 'PMH', 'Surat permohonan', '#F59E0B', 1, NOW(), NOW()),
            ('Laporan', 'LPR', 'Laporan kegiatan, keuangan, dll', '#3B82F6', 1, NOW(), NOW()),
            ('Surat Tugas', 'TGS', 'Surat tugas dan penugasan', '#10B981', 1, NOW(), NOW()),
            ('Edaran', 'EDR', 'Surat edaran', '#06B6D4', 1, NOW(), NOW()),
            ('Lain-lain', 'LLL', 'Kategori lainnya', '#6B7280', 1, NOW(), NOW())
    """)


def downgrade() -> None:
    # Delete seeded categories
    op.execute("DELETE FROM kategori WHERE kode IN ('UND', 'PNG', 'PMH', 'LPR', 'TGS', 'EDR', 'LLL')")

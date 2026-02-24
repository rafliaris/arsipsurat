"""seed org settings

Revision ID: bda8ff67029d
Revises: 99debb66da87
Branch Labels: None
Depends On: None
"""
from alembic import op
import sqlalchemy as sa

revision = 'bda8ff67029d'
down_revision = '99debb66da87'
branch_labels = None
depends_on = None

ORG_KEYS = [
    'org_name', 'org_unit', 'org_address',
    'org_jabatan_ttd', 'org_nama_ttd', 'org_nip_ttd',
]


def upgrade() -> None:
    op.execute("""
        INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, description, is_public, created_at, updated_at)
        VALUES
            ('org_name',        'KEPOLISIAN NEGARA REPUBLIK INDONESIA', 'STRING', 'Nama instansi / organisasi',         TRUE, NOW(), NOW()),
            ('org_unit',        'DAERAH NUSA TENGGARA BARAT',           'STRING', 'Unit/bidang organisasi',            TRUE, NOW(), NOW()),
            ('org_address',     'Jl. Majapahit No. 2, Mataram',        'STRING', 'Alamat instansi',                   TRUE, NOW(), NOW()),
            ('org_jabatan_ttd', 'KEPALA BIRO RENA',                    'STRING', 'Jabatan penandatangan surat keluar', TRUE, NOW(), NOW()),
            ('org_nama_ttd',    'NAMA JABATAN',                        'STRING', 'Nama penandatangan surat keluar',   TRUE, NOW(), NOW()),
            ('org_nip_ttd',     'NIP. 000000000 000000 0 000',         'STRING', 'NIP penandatangan surat keluar',    TRUE, NOW(), NOW())
    """)


def downgrade() -> None:
    op.execute(f"""
        DELETE FROM settings WHERE setting_key IN ({', '.join(f"'{k}'" for k in ORG_KEYS)})
    """)

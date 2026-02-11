"""seed default settings

Revision ID: 99debb66da87
Revises: e87c4344c9e8
Create Date: 2026-02-11 11:05:22.258082

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '99debb66da87'
down_revision = 'e87c4344c9e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Insert default settings
    op.execute("""
        INSERT INTO settings (setting_key, setting_value, setting_type, description, is_public, created_at, updated_at)
        VALUES
            ('app_name', 'Arsip Surat POLDA', 'string', 'Nama aplikasi', TRUE, NOW(), NOW()),
            ('max_file_size', '10485760', 'number', 'Ukuran file maksimal (bytes) - 10MB', TRUE, NOW(), NOW()),
            ('allowed_file_types', '.pdf,.doc,.docx,.jpg,.jpeg,.png', 'string', 'Tipe file yang diizinkan', TRUE, NOW(), NOW()),
            ('ocr_language', 'ind+eng', 'string', 'Bahasa OCR (Tesseract)', FALSE, NOW(), NOW()),
            ('items_per_page', '10', 'number', 'Jumlah item per halaman (default)', TRUE, NOW(), NOW()),
            ('session_timeout', '3600', 'number', 'Session timeout (detik) - 1 jam', FALSE, NOW(), NOW()),
            ('enable_ocr', 'true', 'boolean', 'Aktifkan OCR otomatis', FALSE, NOW(), NOW()),
            ('auto_classification', 'true', 'boolean', 'Aktifkan klasifikasi otomatis', FALSE, NOW(), NOW()),
            ('storage_path', 'storage', 'string', 'Path penyimpanan file', FALSE, NOW(), NOW()),
            ('email_notifications', 'false', 'boolean', 'Aktifkan notifikasi email', FALSE, NOW(), NOW())
    """)


def downgrade() -> None:
    # Delete seeded settings
    op.execute("""
        DELETE FROM settings WHERE setting_key IN (
            'app_name', 'max_file_size', 'allowed_file_types', 'ocr_language',
            'items_per_page', 'session_timeout', 'enable_ocr', 'auto_classification',
            'storage_path', 'email_notifications'
        )
    """)

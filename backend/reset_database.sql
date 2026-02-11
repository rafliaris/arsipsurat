-- Complete Database Reset Script
-- Drops ALL tables cleanly

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables (order doesn't matter with FK checks off)
DROP TABLE IF EXISTS `disposisi`;
DROP TABLE IF EXISTS `surat_keluar`;
DROP TABLE IF EXISTS `surat_masuk`;
DROP TABLE IF EXISTS `surat`;
DROP TABLE IF EXISTS `kategori`;
DROP TABLE IF EXISTS `notifikasi`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `attachments`;
DROP TABLE IF EXISTS `backup_history`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `alembic_version`;

SET FOREIGN_KEY_CHECKS = 1;

-- Now run: alembic upgrade head

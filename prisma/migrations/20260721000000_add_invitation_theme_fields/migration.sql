-- AlterTable
-- Theme System (BAB 10.6-10.7): override warna & font per-event.
-- `theme` dan `primary_color` sudah ada dari baseline sebelumnya;
-- migration ini menambahkan 3 kolom yang belum pernah tercatat migration-nya.
-- Dibuat idempotent (IF NOT EXISTS) karena migration ini sempat gagal
-- di tengah jalan pada deploy sebelumnya — aman dijalankan ulang baik
-- kolomnya sudah sempat terbentuk sebagian maupun belum sama sekali.
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "secondary_color" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "background_color" TEXT;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "font_id" TEXT NOT NULL DEFAULT 'fraunces-inter';

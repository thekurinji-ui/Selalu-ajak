-- AlterTable
-- Theme System (BAB 10.6-10.7): override warna & font per-event.
-- `theme` dan `primary_color` sudah ada dari baseline sebelumnya;
-- migration ini menambahkan 3 kolom yang belum pernah tercatat migration-nya.
ALTER TABLE "events" ADD COLUMN "secondary_color" TEXT;
ALTER TABLE "events" ADD COLUMN "background_color" TEXT;
ALTER TABLE "events" ADD COLUMN "font_id" TEXT NOT NULL DEFAULT 'fraunces-inter';

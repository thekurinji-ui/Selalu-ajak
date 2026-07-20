-- CreateTable
-- Event Reminders (BAB 20.9): log reminder H-30/H-7/H-1 yang sudah dikirim
-- ke pemilik acara lewat WhatsApp. Dicek oleh cron job harian
-- (GET /api/cron/event-reminders) sebelum kirim, supaya idempotent walau
-- cron kepanggil ulang / retry di hari yang sama.
CREATE TABLE "event_reminder_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "milestone" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_reminder_logs_event_id_idx" ON "event_reminder_logs"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_reminder_logs_event_id_milestone_key" ON "event_reminder_logs"("event_id", "milestone");

-- AddForeignKey
ALTER TABLE "event_reminder_logs" ADD CONSTRAINT "event_reminder_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

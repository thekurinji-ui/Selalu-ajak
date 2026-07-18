-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "archived_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "notification_preferences" JSONB DEFAULT '{}';

-- CreateIndex
CREATE INDEX "notifications_user_id_category_idx" ON "notifications"("user_id", "category");

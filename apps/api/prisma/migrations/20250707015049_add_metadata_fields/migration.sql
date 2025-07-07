-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "WebhookLog" ADD COLUMN     "metadata" JSONB;

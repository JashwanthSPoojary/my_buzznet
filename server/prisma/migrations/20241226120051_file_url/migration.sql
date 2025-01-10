-- AlterTable
ALTER TABLE "channel_message" ADD COLUMN     "file_url" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "direct_messages" ADD COLUMN     "file_url" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

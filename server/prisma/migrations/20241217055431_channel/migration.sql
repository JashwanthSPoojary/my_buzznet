/*
  Warnings:

  - You are about to drop the column `sender` on the `channel_message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channel_message" DROP COLUMN "sender",
ADD COLUMN     "sender_id" INTEGER;

-- AddForeignKey
ALTER TABLE "channel_message" ADD CONSTRAINT "channel_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

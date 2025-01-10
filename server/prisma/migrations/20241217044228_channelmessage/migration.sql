/*
  Warnings:

  - You are about to drop the column `user_id` on the `channel_message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "channel_message" DROP CONSTRAINT "channel_message_user_id_fkey";

-- AlterTable
ALTER TABLE "channel_message" DROP COLUMN "user_id";

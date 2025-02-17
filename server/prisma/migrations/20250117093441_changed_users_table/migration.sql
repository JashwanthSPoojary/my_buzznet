-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password_hash" DROP NOT NULL;

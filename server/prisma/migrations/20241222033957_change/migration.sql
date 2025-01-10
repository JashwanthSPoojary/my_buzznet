/*
  Warnings:

  - Added the required column `created_by` to the `workspace_invitation_links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspace_invitation_links" ADD COLUMN     "created_by" INTEGER NOT NULL;

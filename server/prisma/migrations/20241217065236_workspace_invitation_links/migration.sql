-- CreateTable
CREATE TABLE "workspace_invitation_links" (
    "id" SERIAL NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invitation_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitation_links_token_key" ON "workspace_invitation_links"("token");

-- AddForeignKey
ALTER TABLE "workspace_invitation_links" ADD CONSTRAINT "workspace_invitation_links_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

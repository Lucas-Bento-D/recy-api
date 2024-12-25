/*
  Warnings:

  - The `authProvider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "authId" DROP NOT NULL,
DROP COLUMN "authProvider",
ADD COLUMN     "authProvider" TEXT;

-- DropEnum
DROP TYPE "AuthProvider";

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_authId_key" ON "User"("authProvider", "authId");

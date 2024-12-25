/*
  Warnings:

  - A unique constraint covering the columns `[authProvider,authId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authProvider` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'AUTH0');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authId" TEXT NOT NULL,
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL,
ADD COLUMN     "picture" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_authProvider_authId_key" ON "User"("authProvider", "authId");

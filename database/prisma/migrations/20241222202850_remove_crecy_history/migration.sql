/*
  Warnings:

  - You are about to drop the column `crecyPrice` on the `UserHistory` table. All the data in the column will be lost.
  - You are about to drop the column `totalCrecyInWallet` on the `UserHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserHistory" DROP COLUMN "crecyPrice",
DROP COLUMN "totalCrecyInWallet";

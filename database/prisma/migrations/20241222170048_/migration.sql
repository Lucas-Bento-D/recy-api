/*
  Warnings:

  - You are about to drop the column `percentageChangeCrecyBalance` on the `UserHistory` table. All the data in the column will be lost.
  - You are about to drop the column `percentageChangeCrecyPrice` on the `UserHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserHistory" DROP COLUMN "percentageChangeCrecyBalance",
DROP COLUMN "percentageChangeCrecyPrice",
ADD COLUMN     "percentageChangeReports" DOUBLE PRECISION;

/*
  Warnings:

  - You are about to drop the column `evidenceUrl` on the `RecyclingReport` table. All the data in the column will be lost.
  - Added the required column `residueEvidence` to the `RecyclingReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecyclingReport" RENAME COLUMN "evidenceUrl" TO "residueEvidence";

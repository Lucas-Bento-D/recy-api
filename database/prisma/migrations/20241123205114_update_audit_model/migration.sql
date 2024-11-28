-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_auditorId_fkey";

-- AlterTable
ALTER TABLE "Audit" ALTER COLUMN "auditorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

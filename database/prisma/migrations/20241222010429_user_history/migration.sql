-- CreateTable
CREATE TABLE "UserHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalResidueKgs" DOUBLE PRECISION NOT NULL,
    "totalReports" INTEGER NOT NULL,
    "crecyPrice" DOUBLE PRECISION NOT NULL,
    "totalCrecyInWallet" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percentageChangeResidueKgs" DOUBLE PRECISION,
    "percentageChangeCrecyPrice" DOUBLE PRECISION,
    "percentageChangeCrecyBalance" DOUBLE PRECISION,

    CONSTRAINT "UserHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserHistory_userId_idx" ON "UserHistory"("userId");

-- AddForeignKey
ALTER TABLE "UserHistory" ADD CONSTRAINT "UserHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "reconciliation" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "startPeriod" TIMESTAMP(3) NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "expectedCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expectedCard" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actualCard" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reconciliation_businessId_idx" ON "reconciliation"("businessId");

-- CreateIndex
CREATE INDEX "reconciliation_updatedAt_idx" ON "reconciliation"("updatedAt");

-- AddForeignKey
ALTER TABLE "reconciliation" ADD CONSTRAINT "reconciliation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

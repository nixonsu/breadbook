-- CreateEnum
CREATE TYPE "ClientSyncTrigger" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "ClientSyncOutcome" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "client_sync_attempt" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trigger" "ClientSyncTrigger" NOT NULL,
    "outcome" "ClientSyncOutcome" NOT NULL,
    "errors" JSONB,

    CONSTRAINT "client_sync_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_sync_attempt_businessId_idx" ON "client_sync_attempt"("businessId");

-- CreateIndex
CREATE INDEX "client_sync_attempt_attemptedAt_idx" ON "client_sync_attempt"("attemptedAt");

-- AddForeignKey
ALTER TABLE "client_sync_attempt" ADD CONSTRAINT "client_sync_attempt_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

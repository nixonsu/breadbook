/*
  Warnings:

  - Made the column `cardAmount` on table `transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cashAmount` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "cardAmount" SET NOT NULL,
ALTER COLUMN "cashAmount" SET NOT NULL;

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function createReconciliation(
  businessId: number,
  startPeriod: Date,
  endPeriod: Date,
  expectedCash: number,
  expectedCard: number,
  actualCash: number,
  actualCard: number,
) {
  await prisma.reconciliation.create({
    data: {
      businessId,
      startPeriod,
      endPeriod,
      expectedCash,
      expectedCard,
      actualCash,
      actualCard,
    },
  });
}

export async function getReconciliations(businessId: number) {
  return await prisma.reconciliation.findMany({
    where: {
      businessId,
    },
    orderBy: {
      endPeriod: "desc",
    },
  });
}

import {
  PrismaClient,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function createSale(
  businessId: number,
  clientId: number,
  date: string | Date,
  notes: string,
  cardAmount: number,
  cashAmount: number,
): Promise<Transaction> {
  const transaction = await prisma.transaction.create({
    data: {
      business: { connect: { id: businessId } },
      client: { connect: { id: clientId } },
      type: TransactionType.INCOME,
      category: TransactionCategory.SALE,
      cardAmount,
      cashAmount,
      notes,
      occurredAt: new Date(date),
      updatedAt: new Date(),
    },
  });

  return transaction;
}

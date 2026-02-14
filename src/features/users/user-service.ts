import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { User } from "./user-model";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function getUser(email: string): Promise<User> {
  const user: User = await prisma.user.findUniqueOrThrow({
    where: {
      email: email,
    },
  });

  return user;
}

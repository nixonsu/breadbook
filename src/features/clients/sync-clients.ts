import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import fs from "fs";
import Papa from "papaparse";

const file = fs.readFileSync("src/features/clients/clients.csv", "utf-8");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  notes: string | null;
}

async function main() {
  console.log("Starting to sync clients...");
  console.log("Parsing CSV file...");
  const result: Papa.ParseResult<Client> = Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) =>
      h.replace(/\s+/g, "").replace(/^./, (c) => c.toLowerCase()),
    transform: (value, field) => {
      if (field === "notes" || field === "phone") {
        const trimmedValue = value.replace(/'/g, "").trim();

        if (trimmedValue === "") {
          return null;
        }

        return trimmedValue;
      }
      return value;
    },
  });
  console.log(`Parsed CSV file with ${result.data.length} clients`);

  console.log("Syncing clients with database...");
  for (const client of result.data) {
    // First name + last name are used as unique identifiers
    const existingClient = await prisma.client.findFirst({
      where: {
        firstName: client.firstName,
        lastName: client.lastName,
      },
    });

    if (existingClient) {
      console.log(`EXISTS: ${client.firstName} ${client.lastName}`);

      let emailChanged = false;
      let phoneChanged = false;

      if (existingClient.email !== client.email) {
        emailChanged = true;
      }

      if (existingClient.phoneNumber !== client.phone) {
        phoneChanged = true;
      }

      if (emailChanged) {
        await prisma.client.updateMany({
          where: {
            firstName: client.firstName,
            lastName: client.lastName,
          },
          data: {
            email: client.email,
          },
        });
        console.log(
          `UPDATE: Email for ${client.firstName} ${client.lastName}: ${existingClient.email} -> ${client.email}`,
        );
      }

      if (phoneChanged) {
        await prisma.client.updateMany({
          where: {
            firstName: client.firstName,
            lastName: client.lastName,
          },
          data: {
            phoneNumber: client.phone,
          },
        });
        console.log(
          `UPDATE: Phone number for ${client.firstName} ${client.lastName}: ${existingClient.phoneNumber} -> ${client.phone}`,
        );
      }
    } else {
      await prisma.client.create({
        data: {
          businessId: 1,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phone,
        },
      });
      console.log(`CREATE: ${client.firstName} ${client.lastName}`);
    }
  }

  console.log("Finished syncing clients");
}

main();

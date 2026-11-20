import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { veyloPrisma?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.veyloPrisma) return globalForPrisma.veyloPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  return (globalForPrisma.veyloPrisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  }));
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString =
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL;

if (!connectionString || !(connectionString.startsWith("postgres://") || connectionString.startsWith("postgresql://"))) {
  throw new Error("Postgres runtime URL tidak valid. Set POSTGRES_URL/POSTGRES_PRISMA_URL (atau DATABASE_URL) ke postgres://...");
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@admin.local";
const password = process.env.SEED_ADMIN_PASSWORD ?? "password123";
const passwordHash = await hash(password, 10);

await prisma.user.upsert({
  where: { email },
  update: {
    name: "Admin",
    password: passwordHash,
  },
  create: {
    name: "Admin",
    email,
    password: passwordHash,
  },
});

console.log(`Seeded auth user: ${email}`);
await prisma.$disconnect();

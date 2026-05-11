import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function listUsers(params?: {
  skip?: number;
  take?: number;
  query?: string;
}): Promise<User[]> {
  const where: Prisma.UserWhereInput | undefined = params?.query
    ? {
        OR: [
          { name: { contains: params.query } },
          { email: { contains: params.query } },
        ],
      }
    : undefined;

  return prisma.user.findMany({
    where,
    skip: params?.skip,
    take: params?.take,
    orderBy: { id: "asc" },
  });
}

export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  emailVerifiedAt?: Date | null;
}): Promise<User> {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      emailVerifiedAt: data.emailVerifiedAt ?? null,
    },
  });
}

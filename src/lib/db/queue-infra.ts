import type { CacheEntry, Job, JobBatch, Session } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function upsertCacheEntry(input: {
  key: string;
  value: string;
  expiration: bigint;
}): Promise<CacheEntry> {
  return prisma.cacheEntry.upsert({
    where: { key: input.key },
    update: { value: input.value, expiration: input.expiration },
    create: { key: input.key, value: input.value, expiration: input.expiration },
  });
}

export async function createSession(input: {
  id: string;
  payload: string;
  lastActivity: number;
  userId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<Session> {
  return prisma.session.create({
    data: {
      id: input.id,
      payload: input.payload,
      lastActivity: input.lastActivity,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function enqueueJob(input: {
  queue: string;
  payload: string;
  attempts?: number;
  availableAt: number;
  reservedAt?: number | null;
  createdAt: number;
}): Promise<Job> {
  return prisma.job.create({
    data: {
      queue: input.queue,
      payload: input.payload,
      attempts: input.attempts ?? 0,
      availableAt: input.availableAt,
      reservedAt: input.reservedAt ?? null,
      createdAt: input.createdAt,
    },
  });
}

export async function createJobBatch(input: {
  id: string;
  name: string;
  totalJobs: number;
  pendingJobs: number;
  failedJobs: number;
  failedJobIds: string;
  createdAt: number;
  options?: string | null;
  cancelledAt?: number | null;
  finishedAt?: number | null;
}): Promise<JobBatch> {
  return prisma.jobBatch.create({
    data: {
      id: input.id,
      name: input.name,
      totalJobs: input.totalJobs,
      pendingJobs: input.pendingJobs,
      failedJobs: input.failedJobs,
      failedJobIds: input.failedJobIds,
      createdAt: input.createdAt,
      options: input.options ?? null,
      cancelledAt: input.cancelledAt ?? null,
      finishedAt: input.finishedAt ?? null,
    },
  });
}

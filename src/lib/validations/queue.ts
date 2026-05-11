import { z } from "zod";

export const loketCodeSchema = z.enum(["A", "B", "C", "D"]);
export const loketNumberSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);

export const queueItemSchema = z.object({
  nomor: z.string().regex(/^[A-D]-\d{3}$/),
  loket: loketNumberSchema,
  layanan: z.string().min(1),
  kode: loketCodeSchema,
  waktu: z.number().int().nonnegative(),
});

export const pendingQueuesSchema = z.record(loketCodeSchema, z.array(queueItemSchema));

export type QueueItemInput = z.infer<typeof queueItemSchema>;

import { z } from "zod";

export const bootTokenQuerySchema = z.object({
  refresh: z
    .enum(["0", "1"])
    .optional()
    .transform((value) => value === "1"),
});

export type BootTokenQuery = z.infer<typeof bootTokenQuerySchema>;

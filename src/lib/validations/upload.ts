import { z } from "zod";

export const uploadRequestSchema = z.object({
  folder: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9/_-]+$/).default("uploads"),
});

export const uploadConstraints = {
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const,
};

export type UploadFolderInput = z.infer<typeof uploadRequestSchema>;

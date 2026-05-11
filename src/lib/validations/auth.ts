import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(8),
});

export type SignInInput = z.infer<typeof signInSchema>;

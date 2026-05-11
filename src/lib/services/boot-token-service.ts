import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const tokenFilePath = path.join(process.cwd(), "storage", "framework", "boot_token.txt");

export async function ensureBootToken(forceRefresh: boolean): Promise<string> {
  await fs.mkdir(path.dirname(tokenFilePath), { recursive: true });

  if (!forceRefresh) {
    try {
      const existing = await fs.readFile(tokenFilePath, "utf8");
      if (existing.trim().length > 0) return existing.trim();
    } catch {
      // Ignore not-found and regenerate below.
    }
  }

  const token = randomUUID();
  await fs.writeFile(tokenFilePath, token, "utf8");
  return token;
}

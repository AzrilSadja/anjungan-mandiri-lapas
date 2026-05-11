import { apiGet } from "@/lib/api";
import type { BootTokenDto } from "@/lib/api/types";

export async function fetchBootToken(refresh = false): Promise<BootTokenDto> {
  const query = refresh ? "?refresh=1" : "";
  return apiGet<BootTokenDto>(`/api/boot-token${query}`);
}

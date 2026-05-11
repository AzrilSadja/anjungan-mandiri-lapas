import { fetchBootToken } from "@/lib/api/boot-token";
import { resetAllQueueData } from "@/lib/queue/storage";
import { storageKeys } from "@/lib/utils/storage-keys";

export async function syncBootToken(): Promise<void> {
  try {
    const data = await fetchBootToken(false);
    const previousToken = localStorage.getItem(storageKeys.bootToken);
    if (previousToken !== data.token) {
      resetAllQueueData("server-restart");
      localStorage.setItem(storageKeys.bootToken, data.token);
    }
  } catch {
    // Ignore network/server errors for kiosk resilience.
  }
}

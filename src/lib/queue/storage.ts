import { type CurrentQueue, type QueueCounters, type QueueItem, defaultCounters, defaultCurrentQueue } from "@/lib/queue/types";

const parse = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const queueStorage = {
  getCounters: (): QueueCounters => parse("queueCounters", defaultCounters),
  setCounters: (value: QueueCounters): void => localStorage.setItem("queueCounters", JSON.stringify(value)),
  getCurrentQueue: (): CurrentQueue => parse("currentQueue", defaultCurrentQueue),
  setCurrentQueue: (value: CurrentQueue): void => localStorage.setItem("currentQueue", JSON.stringify(value)),
  getPendingQueues: (): Record<string, QueueItem[]> => parse("pendingQueues", { A: [], B: [], C: [], D: [] }),
  setPendingQueues: (value: Record<string, QueueItem[]>): void => localStorage.setItem("pendingQueues", JSON.stringify(value)),
};

export function resetAllQueueData(resetValue: string): void {
  localStorage.removeItem("queueCounters");
  localStorage.removeItem("currentQueue");
  localStorage.removeItem("queueBaru");
  localStorage.removeItem("panggilanBaru");
  localStorage.removeItem("pendingQueues");
  localStorage.setItem("queueReset", resetValue);
}

import type { CurrentQueue, LoketCode, LoketNumber, QueueCounters, QueueItem } from "@/lib/queue/types";

export type QueueSnapshot = {
  counters: QueueCounters;
  currentQueue: CurrentQueue;
  pendingQueues: Record<LoketCode, QueueItem[]>;
  latestCalled: QueueItem | null;
  latestIssued: QueueItem | null;
  businessDate: string;
};

async function unwrap<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request gagal");
  }
  const json = (await response.json()) as { data: T };
  return json.data;
}

export async function getQueueState(): Promise<QueueSnapshot> {
  const response = await fetch("/api/queue/state", { cache: "no-store" });
  return unwrap<QueueSnapshot>(response);
}

export async function issueQueueTicket(input: {
  code: LoketCode;
  loket: LoketNumber;
  layanan: string;
}): Promise<QueueItem> {
  const response = await fetch("/api/queue/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<QueueItem>(response);
}

export async function callQueueTicket(loket: LoketNumber): Promise<QueueItem> {
  const response = await fetch("/api/queue/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loket }),
  });
  return unwrap<QueueItem>(response);
}

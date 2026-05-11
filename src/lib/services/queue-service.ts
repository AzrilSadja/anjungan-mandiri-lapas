import { queueItemSchema, type QueueItemInput } from "@/lib/validations/queue";
import { formatQueueNumber } from "@/lib/utils/date";
import type { CurrentQueue, LoketCode, LoketNumber, QueueCounters, QueueItem } from "@/lib/queue/types";

type PendingQueues = Record<LoketCode, QueueItem[]>;

export function issueTicket(input: {
  counters: QueueCounters;
  code: LoketCode;
  loket: LoketNumber;
  layanan: string;
  timestamp: number;
}): { nextCounters: QueueCounters; ticket: QueueItemInput } {
  const nextCount = input.counters[input.code] + 1;
  const nomor = formatQueueNumber(input.code, nextCount);

  const ticket = queueItemSchema.parse({
    nomor,
    loket: input.loket,
    layanan: input.layanan,
    kode: input.code,
    waktu: input.timestamp,
  });

  return {
    nextCounters: { ...input.counters, [input.code]: nextCount },
    ticket,
  };
}

export function enqueueTicket(pending: PendingQueues, ticket: QueueItemInput): PendingQueues {
  const next = { ...pending, [ticket.kode]: [...pending[ticket.kode], ticket] };
  return next;
}

export function callNextQueue(input: {
  loket: LoketNumber;
  currentQueue: CurrentQueue;
  pendingQueues: PendingQueues;
}): {
  currentQueue: CurrentQueue;
  pendingQueues: PendingQueues;
  called: QueueItem | null;
} {
  const loketCodeMap: Record<LoketNumber, LoketCode> = { 1: "A", 2: "B", 3: "C", 4: "D" };
  const code = loketCodeMap[input.loket];
  const queue = input.pendingQueues[code];

  if (queue.length === 0) {
    return { currentQueue: input.currentQueue, pendingQueues: input.pendingQueues, called: null };
  }

  const [called, ...rest] = queue;
  const nextPending = { ...input.pendingQueues, [code]: rest };
  const nextCurrent = { ...input.currentQueue, [input.loket]: { nomor: called.nomor, kode: code } };

  return { currentQueue: nextCurrent, pendingQueues: nextPending, called };
}

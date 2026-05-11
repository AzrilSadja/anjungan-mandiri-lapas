import { prisma } from "@/lib/db/prisma";
import type { CurrentQueue, LoketCode, LoketNumber, QueueCounters, QueueItem } from "@/lib/queue/types";
import { formatQueueNumber } from "@/lib/utils/date";

type PendingMap = Record<LoketCode, QueueItem[]>;

type QueueSnapshot = {
  counters: QueueCounters;
  currentQueue: CurrentQueue;
  pendingQueues: PendingMap;
  latestCalled: QueueItem | null;
  latestIssued: QueueItem | null;
  businessDate: string;
};

function getJakartaDateHour(now: Date): { dateStr: string; hour: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  return { dateStr: `${year}-${month}-${day}`, hour };
}

function emptyPending(): PendingMap {
  return { A: [], B: [], C: [], D: [] };
}

function toQueueItem(ticket: {
  nomor: string;
  loket: number;
  layanan: string;
  kode: string;
  waktu: bigint;
}): QueueItem {
  return {
    nomor: ticket.nomor,
    loket: ticket.loket as LoketNumber,
    layanan: ticket.layanan,
    kode: ticket.kode as LoketCode,
    waktu: Number(ticket.waktu),
  };
}

export async function ensureQueueState(): Promise<{ businessDate: string }> {
  const { dateStr, hour } = getJakartaDateHour(new Date());
  const base = await prisma.queueState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, businessDate: dateStr },
  });

  if (hour >= 1 && base.businessDate !== dateStr) {
    await prisma.$transaction([
      prisma.queueState.update({
        where: { id: 1 },
        data: {
          businessDate: dateStr,
          counterA: 0,
          counterB: 0,
          counterC: 0,
          counterD: 0,
          currentA: "A-000",
          currentB: "B-000",
          currentC: "C-000",
          currentD: "D-000",
        },
      }),
      prisma.queueTicket.updateMany({
        where: { status: "pending" },
        data: { status: "expired" },
      }),
    ]);
    return { businessDate: dateStr };
  }

  return { businessDate: base.businessDate };
}

export async function getQueueSnapshot(): Promise<QueueSnapshot> {
  const { businessDate } = await ensureQueueState();
  const [state, pending, latestCalled, latestIssued] = await Promise.all([
    prisma.queueState.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.queueTicket.findMany({
      where: { status: "pending", businessDate },
      orderBy: { id: "asc" },
    }),
    prisma.queueTicket.findFirst({
      where: { status: "called", businessDate },
      orderBy: { id: "desc" },
    }),
    prisma.queueTicket.findFirst({
      where: { businessDate },
      orderBy: { id: "desc" },
    }),
  ]);

  const pendingQueues = emptyPending();
  for (const item of pending) {
    const key = item.kode as LoketCode;
    if (key in pendingQueues) pendingQueues[key].push(toQueueItem(item));
  }

  return {
    counters: {
      A: state.counterA,
      B: state.counterB,
      C: state.counterC,
      D: state.counterD,
    },
    currentQueue: {
      1: { nomor: state.currentA, kode: "A" },
      2: { nomor: state.currentB, kode: "B" },
      3: { nomor: state.currentC, kode: "C" },
      4: { nomor: state.currentD, kode: "D" },
    },
    pendingQueues,
    latestCalled: latestCalled ? toQueueItem(latestCalled) : null,
    latestIssued: latestIssued ? toQueueItem(latestIssued) : null,
    businessDate,
  };
}

export async function issueQueue(input: {
  code: LoketCode;
  loket: LoketNumber;
  layanan: string;
  waktu: number;
}): Promise<QueueItem> {
  const { businessDate } = await ensureQueueState();

  return prisma.$transaction(async (tx) => {
    const state = await tx.queueState.findUniqueOrThrow({ where: { id: 1 } });
    const counterMap = {
      A: state.counterA,
      B: state.counterB,
      C: state.counterC,
      D: state.counterD,
    } as QueueCounters;

    const nextCounter = counterMap[input.code] + 1;
    const nomor = formatQueueNumber(input.code, nextCounter);

    const updateData =
      input.code === "A"
        ? { counterA: nextCounter }
        : input.code === "B"
          ? { counterB: nextCounter }
          : input.code === "C"
            ? { counterC: nextCounter }
            : { counterD: nextCounter };

    await tx.queueState.update({ where: { id: 1 }, data: updateData });

    const ticket = await tx.queueTicket.create({
      data: {
        businessDate,
        nomor,
        loket: input.loket,
        layanan: input.layanan,
        kode: input.code,
        waktu: BigInt(input.waktu),
        status: "pending",
      },
    });

    return toQueueItem(ticket);
  });
}

export async function callNextQueueByLoket(loket: LoketNumber): Promise<QueueItem | null> {
  const { businessDate } = await ensureQueueState();
  const code = (loket === 1 ? "A" : loket === 2 ? "B" : loket === 3 ? "C" : "D") as LoketCode;

  return prisma.$transaction(async (tx) => {
    const nextPending = await tx.queueTicket.findFirst({
      where: { status: "pending", businessDate, kode: code },
      orderBy: { id: "asc" },
    });

    if (!nextPending) return null;

    await tx.queueTicket.update({
      where: { id: nextPending.id },
      data: { status: "called", calledAt: new Date() },
    });

    const currentField =
      loket === 1
        ? { currentA: nextPending.nomor }
        : loket === 2
          ? { currentB: nextPending.nomor }
          : loket === 3
            ? { currentC: nextPending.nomor }
            : { currentD: nextPending.nomor };

    await tx.queueState.update({ where: { id: 1 }, data: currentField });

    return toQueueItem(nextPending);
  });
}

export async function forceResetQueues(): Promise<void> {
  const { dateStr } = getJakartaDateHour(new Date());
  await prisma.$transaction([
    prisma.queueState.upsert({
      where: { id: 1 },
      update: {
        businessDate: dateStr,
        counterA: 0,
        counterB: 0,
        counterC: 0,
        counterD: 0,
        currentA: "A-000",
        currentB: "B-000",
        currentC: "C-000",
        currentD: "D-000",
      },
      create: {
        id: 1,
        businessDate: dateStr,
        counterA: 0,
        counterB: 0,
        counterC: 0,
        counterD: 0,
        currentA: "A-000",
        currentB: "B-000",
        currentC: "C-000",
        currentD: "D-000",
      },
    }),
    prisma.queueTicket.updateMany({
      where: { status: "pending" },
      data: { status: "expired" },
    }),
  ]);
}

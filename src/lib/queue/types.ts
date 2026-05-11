export type LoketCode = "A" | "B" | "C" | "D";

export type LoketNumber = 1 | 2 | 3 | 4;

export type QueueItem = {
  nomor: string;
  loket: LoketNumber;
  layanan: string;
  kode: LoketCode;
  waktu: number;
};

export type QueueCounters = Record<LoketCode, number>;

export type CurrentQueue = Record<LoketNumber, { nomor: string; kode: LoketCode }>;

export const defaultCounters: QueueCounters = { A: 0, B: 0, C: 0, D: 0 };

export const defaultCurrentQueue: CurrentQueue = {
  1: { nomor: "A-000", kode: "A" },
  2: { nomor: "B-000", kode: "B" },
  3: { nomor: "C-000", kode: "C" },
  4: { nomor: "D-000", kode: "D" },
};

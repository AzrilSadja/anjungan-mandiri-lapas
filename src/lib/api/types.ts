export type ApiErrorPayload = {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
};

export type QueueTicketDto = {
  nomor: string;
  loket: 1 | 2 | 3 | 4;
  layanan: string;
  kode: "A" | "B" | "C" | "D";
  waktu: number;
};

export type BootTokenDto = {
  token: string;
};

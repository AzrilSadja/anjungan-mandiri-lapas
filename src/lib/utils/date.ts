export function nowMs(): number {
  return new Date().getTime();
}

export function formatQueueNumber(code: string, count: number): string {
  return `${code}-${String(count).padStart(3, "0")}`;
}

export function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shouldDailyReset(): boolean {
  const now = new Date();
  const today = getTodayStr();
  const lastResetDate = localStorage.getItem("lastResetDate");
  return now.getHours() >= 1 && lastResetDate !== today;
}

export function markDailyResetDone(): void {
  localStorage.setItem("lastResetDate", getTodayStr());
  localStorage.setItem("queueReset", getTodayStr());
}

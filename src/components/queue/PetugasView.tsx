"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/queue/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { callQueueTicket, getQueueState } from "@/lib/api/queue";
import { type CurrentQueue, type LoketCode, type LoketNumber, type QueueItem, defaultCurrentQueue } from "@/lib/queue/types";

const loketCardClass: Record<LoketNumber, string> = {
  1: "bg-[#1E40AF]",
  2: "bg-[#065F46]",
  3: "bg-[#92400E]",
  4: "bg-[#9F1239]",
};

const loketServiceLabel: Record<LoketNumber, string> = {
  1: "Tamu Dinas",
  2: "Kunjungan Warga Binaan",
  3: "Layanan Informasi",
  4: "Laporan / Pengaduan",
};

const toastClassByCode: Record<LoketCode, string> = {
  A: "border-[#1E40AF] bg-[#1E40AF] text-white",
  B: "border-[#065F46] bg-[#065F46] text-white",
  C: "border-[#92400E] bg-[#92400E] text-white",
  D: "border-[#9F1239] bg-[#9F1239] text-white",
};

type PetugasVariant = "v1" | "v2" | "v3";

export function PetugasView({ variant = "v1" }: { variant?: PetugasVariant }) {
  const [currentQueue, setCurrentQueue] = useState<CurrentQueue>(defaultCurrentQueue);
  const [pendingQueues, setPendingQueues] = useState<Record<LoketCode, QueueItem[]>>({ A: [], B: [], C: [], D: [] });
  const [incomingQueue, setIncomingQueue] = useState<QueueItem | null>(null);
  const [actionError, setActionError] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [sortMode, setSortMode] = useState<"default" | "type">("default");
  const lastIssuedStampRef = useRef<string>("");

  useEffect(() => {
    const syncState = async () => {
      const data = await getQueueState();
      setCurrentQueue(data.currentQueue);
      setPendingQueues(data.pendingQueues);

      const issued = data.latestIssued;
      const stamp = issued ? `${issued.nomor}-${issued.waktu}` : "";
      if (stamp && stamp !== lastIssuedStampRef.current) {
        setIncomingQueue(issued);
      }
      lastIssuedStampRef.current = stamp;
    };

    void syncState();
    const timer = window.setInterval(() => void syncState(), 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const disabledState = useMemo(
    () => ({
      1: pendingQueues.A.length === 0,
      2: pendingQueues.B.length === 0,
      3: pendingQueues.C.length === 0,
      4: pendingQueues.D.length === 0,
    }),
    [pendingQueues],
  );

const loketIndonesia: Record<number, string> = {
  1: "satu",
  2: "dua",
  3: "tiga",
  4: "empat",
};

const nomorIndonesia = (nomor: string) => {
  return nomor
    .split("")
    .map((char) => {
      switch (char) {
        case "0": return "nol";
        case "1": return "satu";
        case "2": return "dua";
        case "3": return "tiga";
        case "4": return "empat";
        case "5": return "lima";
        case "6": return "enam";
        case "7": return "tujuh";
        case "8": return "delapan";
        case "9": return "sembilan";
        default: return char;
      }
    })
    .join(" ");
};

const nextQueue = async (loket: LoketNumber) => {
  try {
    setActionError("");

    await callQueueTicket(loket);

    const data = await getQueueState();
    setCurrentQueue(data.currentQueue);
    setPendingQueues(data.pendingQueues);

    const current = data.currentQueue[loket];

if (current) {

  const huruf = current.code.charAt(0);
  const angka = current.code.slice(1);

  const text = `Nomor antrean ${huruf} ${nomorIndonesia(angka)}. Silakan menuju loket ${loketIndonesia[loket]}`;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "id-ID";
  utterance.rate = 0.8;
  utterance.pitch = 1.4;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

console.log(
  voices.map((v) => ({
    name: v.name,
    lang: v.lang,
  }))
);

const femaleVoice =
  voices.find((v) =>
    v.name.includes("Microsoft Zira")
  ) ||
  voices.find((v) =>
    v.name.includes("Zira")
  ) ||
  voices.find((v) =>
    v.name.toLowerCase().includes("female")
  ) ||
  voices.find((v) =>
    v.name.toLowerCase().includes("zira")
  );

if (femaleVoice) {
  utterance.voice = femaleVoice;
}

utterance.lang = "id-ID";
window.speechSynthesis.speak(utterance);
}

setIncomingQueue(null);

} catch {
  setActionError("Gagal memanggil antrean. Silakan coba lagi.");
}
};

  useEffect(() => {
    if ((variant === "v2" || variant === "v3") && incomingQueue) {
      const timer = window.setTimeout(() => setIncomingQueue(null), 5000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [incomingQueue, variant]);

  const pendingList = useMemo(() => {
    const list = [...pendingQueues.A, ...pendingQueues.B, ...pendingQueues.C, ...pendingQueues.D];
    if (sortMode === "type") {
      return list.sort((a, b) => {
        if (a.kode === b.kode) return a.waktu - b.waktu;
        return a.kode.localeCompare(b.kode);
      });
    }
    return list.sort((a, b) => a.waktu - b.waktu);
  }, [pendingQueues, sortMode]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader />

      {incomingQueue && variant !== "v3" ? (
        <div
          className={`petugas-toast fixed right-4 top-4 z-50 rounded-2xl border-2 px-6 py-4 shadow-2xl ${toastClassByCode[incomingQueue.kode]}`}
        >
          <p className="text-lg font-black">Antrean Baru Masuk!</p>
          <p className="text-sm font-semibold">
            Loket {incomingQueue.loket}: {incomingQueue.nomor} ({incomingQueue.layanan})
          </p>
        </div>
      ) : null}

      <section className={`mx-auto max-w-7xl p-6 ${variant === "v3" && showSidebar ? "xl:pr-[24rem]" : ""}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-4xl font-black">Panel Petugas</h2>
        </div>
        {actionError ? <p className="mb-4 text-center text-sm text-rose-300">{actionError}</p> : null}
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((num) => {
              const loket = num as LoketNumber;
              return (
                <div key={loket} className={`${loketCardClass[loket]} rounded-3xl border-b-4 border-amber-500 p-6`}>
                  <p className="text-lg font-extrabold tracking-wide text-amber-300">
                    Loket {loket} - {loketServiceLabel[loket]}
                  </p>
                  <p className="my-3 text-5xl font-black text-amber-300">{currentQueue[loket].nomor}</p>
                  <button
                    disabled={disabledState[loket]}
                    onClick={() => void nextQueue(loket)}
                    className="w-full rounded-xl bg-amber-500 py-3 font-black text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Panggil Berikutnya
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {variant === "v3" ? (
        <>
          <div className={`fixed top-36 z-50 transition-all ${showSidebar ? "right-[22.75rem]" : "right-4"}`}>
            <Button
              onClick={() => setShowSidebar((prev) => !prev)}
              variant="outline"
              size="icon"
              aria-label={showSidebar ? "Hide panel antrean" : "Show panel antrean"}
              title={showSidebar ? "Hide panel antrean" : "Show panel antrean"}
            >
              {showSidebar ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {showSidebar ? (
            <aside className="fixed right-0 top-28 z-40 h-[calc(100vh-7rem)] w-[22rem] p-3">
              <Card className="h-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Daftar Antrean</CardTitle>
                  <Button
                    onClick={() => setSortMode((prev) => (prev === "default" ? "type" : "default"))}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg border border-slate-600/70 bg-slate-800/80"
                    aria-label={sortMode === "default" ? "Sort by type" : "Sort by waktu masuk"}
                    title={sortMode === "default" ? "Sort: default (waktu masuk)" : "Sort: type"}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="h-[calc(100%-4.5rem)]">
                  <p className="mb-3 text-xs text-slate-300">Sort: {sortMode === "default" ? "Waktu Masuk" : "Type"}</p>
                  <div className="h-[calc(100%-1.5rem)] space-y-2 overflow-auto pr-1">
                    {pendingList.length === 0 ? <p className="text-sm text-slate-300">Belum ada antrean menunggu.</p> : null}
                    {pendingList.map((item) => (
                      <div key={`${item.nomor}-${item.waktu}`} className={`rounded-lg border px-3 py-2 text-sm ${toastClassByCode[item.kode]}`}>
                        <p className="font-black">
                          {item.nomor} • Loket {item.loket}
                        </p>
                        <p className="text-xs">{item.layanan}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

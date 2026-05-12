"use client";

import { useEffect, useState } from "react";

type LoketNumber = 1 | 2 | 3 | 4;

type QueueItem = {
  code: string;
};

type QueueState = {
  currentQueue: Record<LoketNumber, QueueItem>;
  pendingQueues: Record<LoketNumber, number>;
};

const loketLabels: Record<LoketNumber, string> = {
  1: "Tamu Dinas",
  2: "Kunjungan Warga Binaan",
  3: "Layanan Informasi",
  4: "Laporan / Pengaduan",
};

const loketIndonesia: Record<LoketNumber, string> = {
  1: "satu",
  2: "dua",
  3: "tiga",
  4: "empat",
};

const nomorIndonesia = (nomor: string) => {
  return nomor
    .replace(/0/g, " nol ")
    .replace(/1/g, " satu ")
    .replace(/2/g, " dua ")
    .replace(/3/g, " tiga ")
    .replace(/4/g, " empat ")
    .replace(/5/g, " lima ")
    .replace(/6/g, " enam ")
    .replace(/7/g, " tujuh ")
    .replace(/8/g, " delapan ")
    .replace(/9/g, " sembilan ");
};

async function getQueueState(): Promise<QueueState> {
  const res = await fetch("/api/queue/state", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data antrean");
  }

  return res.json();
}

async function callQueueTicket(loket: LoketNumber) {
  const res = await fetch("/api/queue/call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ loket }),
  });

  if (!res.ok) {
    throw new Error("Gagal memanggil antrean");
  }

  return res.json();
}

export default function PetugasView() {
  const [currentQueue, setCurrentQueue] =
    useState<Record<LoketNumber, QueueItem>>({
      1: { code: "A-000" },
      2: { code: "B-000" },
      3: { code: "C-000" },
      4: { code: "D-000" },
    });

  const [pendingQueues, setPendingQueues] =
    useState<Record<LoketNumber, number>>({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    });

  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadQueue();

    const interval = setInterval(() => {
      loadQueue();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      const data = await getQueueState();

      setCurrentQueue(data.currentQueue);
      setPendingQueues(data.pendingQueues);
    } catch (error) {
      console.error(error);
    }
  };
  const nextQueue = async (loket: LoketNumber) => {
  try {
    setActionError("");

    await callQueueTicket(loket);

    const data = await getQueueState();

    const current = data.currentQueue[loket];

    if (!current) return;

    setCurrentQueue(data.currentQueue);
    setPendingQueues(data.pendingQueues);

    const huruf = current.code.charAt(0);
    const angka = current.code.slice(1);

    const text =
      `Nomor antrean ${huruf} ${nomorIndonesia(angka)}. ` +
      `Silakan menuju loket ${loketIndonesia[loket]}`;
      
      const bell = new Audio("/audio/beep.mp3");

bell.volume = 1;

bell.play().catch((err) => {
  console.log("Audio gagal:", err);
});

  } catch (error) {
    console.error(error);
    setActionError("Gagal memanggil antrean. Silakan coba lagi.");
  }
};

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-5xl font-bold mb-8">
        Panel Petugas
      </h1>

      {actionError && (
        <div className="mb-4 text-red-400 text-xl">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(loketLabels) as unknown as LoketNumber[]).map(
          (loket) => (
            <div
              key={loket}
              className="rounded-3xl border-4 border-yellow-400 p-6 bg-blue-900"
            >
              <h2 className="text-3xl font-bold mb-4 text-yellow-300">
                Loket {loket} - {loketLabels[loket]}
              </h2>

              <div className="text-7xl font-extrabold text-yellow-300 mb-6">
                {currentQueue[loket]?.code}
              </div>

              <div className="mb-4 text-xl">
                Sisa antrean: {pendingQueues[loket]}
              </div>

              <button
                onClick={() => nextQueue(loket)}
                className="w-full rounded-2xl bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-2xl py-4"
              >
                Panggil Berikutnya
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
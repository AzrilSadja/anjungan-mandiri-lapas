"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/queue/AppHeader";
import { syncBootToken } from "@/lib/queue/boot-token";
import { issueQueueTicket } from "@/lib/api/queue";
import { type LoketCode, type LoketNumber, type QueueItem } from "@/lib/queue/types";

const serviceConfig: {
  code: LoketCode;
  loket: LoketNumber;
  label: string;
  cardClassName: string;
}[] = [
  { code: "A", loket: 1, label: "Tamu Dinas", cardClassName: "bg-[#1E40AF] hover:bg-[#1A3A9E]" },
  { code: "B", loket: 2, label: "Kunjungan Warga Binaan", cardClassName: "bg-[#065F46] hover:bg-[#05543F]" },
  { code: "C", loket: 3, label: "Layanan Informasi", cardClassName: "bg-[#92400E] hover:bg-[#7F370C]" },
  { code: "D", loket: 4, label: "Laporan / Pengaduan", cardClassName: "bg-[#9F1239] hover:bg-[#8A1032]" },
];

export function PengunjungView() {
  const [activeTicket, setActiveTicket] = useState<QueueItem | null>(null);
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    if (!activeTicket) return;
    const timer = window.setTimeout(() => setActiveTicket(null), 4000);
    return () => window.clearTimeout(timer);
  }, [activeTicket]);

  useEffect(() => {
    void syncBootToken();
    const tokenTimer = window.setInterval(() => void syncBootToken(), 30000);
    return () => {
      window.clearInterval(tokenTimer);
    };
  }, []);

  const takeQueue = async (code: LoketCode, loket: LoketNumber, layanan: string) => {
    try {
      setSubmitError("");
      const ticket = await issueQueueTicket({ code, loket, layanan });
      setActiveTicket(ticket);
      window.setTimeout(() => {
        window.print();
      }, 500);
} catch (err) {
  console.log(err)
  setSubmitError("Gagal mengambil nomor antrean. Silakan coba lagi.");
}
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <AppHeader />
      <section className="mx-auto max-w-6xl p-6">
        <h2 className="mb-8 text-center text-4xl font-black">Pilih Layanan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {serviceConfig.map((service) => (
            <button
              key={service.code}
              onClick={() => void takeQueue(service.code, service.loket, service.label)}
              className={`${service.cardClassName} rounded-3xl border-b-4 border-amber-500 p-8 text-left text-2xl font-black`}
            >
              <p className="text-sm uppercase tracking-widest text-amber-400">Loket {service.loket}</p>
              <p>{service.label}</p>
            </button>
          ))}
        </div>
        {submitError ? <p className="mt-4 text-center text-sm text-rose-300">{submitError}</p> : null}
      </section>

      {activeTicket ? (
        <div className="queue-print-ticket queue-print-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="queue-print-card w-full max-w-sm rounded-3xl bg-white p-8 text-center text-slate-900 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Lapas Kelas IIA Pekalongan</p>
            <p className="mt-4 text-sm font-semibold text-slate-500">Nomor Antrean Anda:</p>
            <p className="my-1 text-[90px] font-black text-slate-900">{activeTicket.nomor}</p>
            <p className="text-lg font-black uppercase text-blue-900">{activeTicket.layanan}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(activeTicket.waktu).toLocaleString("id-ID")}</p>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
  @media print {

  body * {
    visibility: hidden !important;
  }

  .queue-print-ticket,
  .queue-print-ticket * {
    visibility: visible !important;
  }

  .queue-print-ticket {
    display: flex !important;
    justify-content: center !important;
    align-items: flex-start !important;
    padding-top: 10px !important;
    position: fixed !important;
    inset: 0 !important;
    background: white !important;
  }

  .queue-print-card {
    width: 72mm !important;
    padding: 10px !important;
    border: 2px solid black !important;
    border-radius: 10px !important;
    text-align: center !important;
    box-shadow: none !important;
    background: white !important;
    margin: 0 auto !important;

    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    gap: 6px !important;
  }

  @page {
    size: 80mm auto;
    margin: 0;
  }
}
  `}</style>
    </main>
  );
}
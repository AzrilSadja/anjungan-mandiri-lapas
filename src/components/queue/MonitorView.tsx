"use client";

import { useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/queue/AppHeader";
import { RunningFooter } from "@/components/queue/RunningFooter";
import { getQueueState } from "@/lib/api/queue";
import { syncBootToken } from "@/lib/queue/boot-token";
import { setupSpeechUnlockOnInteraction, speakText } from "@/lib/queue/speech";

const defaultHistory = { 1: "A-000", 2: "B-000", 3: "C-000", 4: "D-000" };

const loketCardClass: Record<number, string> = {
  1: "bg-[#1E40AF]",
  2: "bg-[#065F46]",
  3: "bg-[#92400E]",
  4: "bg-[#9F1239]",
};

const youtubeId = process.env.NEXT_PUBLIC_MONITOR_YOUTUBE_ID || "jJpbrFMzabk";
const youtubeSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}`;

export function MonitorView() {
  const [callState, setCallState] = useState<{ nomor: string; loket: string }>({ nomor: "---", loket: "-" });
  const [history, setHistory] = useState<Record<number, string>>(defaultHistory);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const latestStampRef = useRef<string>("");

  useEffect(() => {
    setupSpeechUnlockOnInteraction();
    void syncBootToken();
    const tokenTimer = window.setInterval(() => void syncBootToken(), 30000);

    const syncState = async () => {
      const data = await getQueueState();
      setHistory({
        1: data.currentQueue[1].nomor,
        2: data.currentQueue[2].nomor,
        3: data.currentQueue[3].nomor,
        4: data.currentQueue[4].nomor,
      });

      if (data.latestCalled) {
        setCallState({ nomor: data.latestCalled.nomor, loket: String(data.latestCalled.loket) });
        const stamp = `${data.latestCalled.nomor}-${data.latestCalled.waktu}`;
        if (latestStampRef.current && stamp !== latestStampRef.current) {
          setIsCalling(true);
          speakText(`Nomor antrean ${data.latestCalled.nomor}, silakan menuju loket ${data.latestCalled.loket}`);
          window.setTimeout(() => setIsCalling(false), 5000);
        }
        latestStampRef.current = stamp;
      } else {
        setCallState({ nomor: "---", loket: "-" });
      }
    };

    void syncState();
    const pollTimer = window.setInterval(() => void syncState(), 5000);
    return () => {
      window.clearInterval(tokenTimer);
      window.clearInterval(pollTimer);
    };
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-white">
      <div className="flex h-full flex-col">
        <AppHeader />

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 pb-16">
          <section className="grid min-h-0 flex-[65] grid-cols-1 gap-4 md:grid-cols-12">
            <div
              className={`${isCalling ? "monitor-call-anim" : ""} rounded-3xl border-4 border-blue-600 bg-slate-800 p-8 text-center md:col-span-4 md:flex md:h-full md:flex-col md:justify-center`}
            >
              <p className="mb-4 text-3xl font-black">LOKET {callState.loket}</p>
              <p className="text-lg">Nomor Antrean</p>
              <p className="text-7xl font-black text-amber-400">{callState.nomor}</p>
            </div>

            <div className="overflow-hidden rounded-3xl bg-black md:col-span-8 md:h-full">
              <iframe
                className="h-full min-h-[220px] w-full"
                src={youtubeSrc}
                title="Media Monitor"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </section>

          <section className="grid min-h-0 flex-[18] grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((key) => (
              <div key={key} className={`${loketCardClass[key]} rounded-2xl p-4 text-center text-4xl font-black md:flex md:h-full md:items-center md:justify-center`}>
                {history[key]}
              </div>
            ))}
          </section>
        </div>
      </div>

      <RunningFooter fixed />
    </main>
  );
}

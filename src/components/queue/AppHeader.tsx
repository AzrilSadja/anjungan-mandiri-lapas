"use client";

import { useEffect, useState } from "react";

export function AppHeader() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="border-b-4 border-amber-500 bg-blue-900 p-4 shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white md:text-3xl">LAPAS KELAS IIA PEKALONGAN</h1>
          <p className="font-bold italic text-amber-400">&quot;BERBAKTI NYATA, PRIMA MELAYANI&quot;</p>
        </div>
        <div className="text-right text-white">
          <p className="text-3xl font-black text-amber-400">{now.toLocaleTimeString("id-ID")}</p>
          <p className="font-semibold">
            {now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </header>
  );
}

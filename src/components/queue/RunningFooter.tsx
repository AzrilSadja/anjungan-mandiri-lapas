type RunningFooterProps = {
  fixed?: boolean;
};

export function RunningFooter({ fixed = true }: RunningFooterProps) {
  return (
    <footer className={`${fixed ? "fixed bottom-0 w-full" : "w-full"} overflow-hidden bg-slate-900 p-3 text-amber-300`}>
      <p className="inline-block animate-[marquee_25s_linear_infinite] whitespace-nowrap font-bold [padding-left:100%]">
        Selamat Datang di Lembaga Pemasyarakatan Kelas IIA Pekalongan • Dilarang Memberikan Gratifikasi dalam bentuk
        apapun kepada Petugas kami • Pelayanan pendaftaran dibuka pukul 08.00 s/d 12.00 WIB • Budayakan Mengantre
        dengan Tertib •
      </p>
    </footer>
  );
}

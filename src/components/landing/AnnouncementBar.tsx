"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// BAB 6.3.1 — Announcement Bar: banner kecil paling atas landing page.
// Dismissible per-sesi browser (useState, bukan localStorage) supaya tetap
// muncul lagi saat user kembali di kunjungan berikutnya.
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-forest-700 px-4 py-2.5 text-center text-sm text-ivory">
      <Link href="/register" className="font-medium underline-offset-2 hover:underline">
        ✨ Gratis membuat satu acara — mulai sekarang, tanpa kartu kredit.
      </Link>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Tutup pengumuman"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ivory/70 transition hover:bg-white/10 hover:text-ivory"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

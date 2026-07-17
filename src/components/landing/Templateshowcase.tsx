"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TemplateItem = {
  id: string;
  name: string;
  description: string | null;
  thumbnailUrl: string;
  isPremium: boolean;
  eventType: string | null;
};

// BAB 6.3.7 — Template Showcase. Filter kategori sesuai blueprint: Wedding,
// Birthday, Engagement, Corporate, Graduation. `eventType` di database
// memakai enum EventType (BAB 24) — dipetakan ke label & kategori filter di
// bawah ini. Template dengan eventType = null dianggap cocok untuk semua
// kategori ("Semua").
const CATEGORY_FILTERS = [
  { key: "ALL", label: "Semua", match: null as string[] | null },
  { key: "WEDDING", label: "Wedding", match: ["PERNIKAHAN"] },
  { key: "BIRTHDAY", label: "Birthday", match: ["ULANG_TAHUN"] },
  { key: "ENGAGEMENT", label: "Engagement", match: ["LAMARAN", "TUNANGAN"] },
  { key: "CORPORATE", label: "Corporate", match: ["CORPORATE_EVENT", "SEMINAR", "WORKSHOP", "GATHERING", "PELUNCURAN_PRODUK"] },
  { key: "GRADUATION", label: "Graduation", match: ["WISUDA"] },
];

export function TemplateShowcase({ templates }: { templates: TemplateItem[] }) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const filter = CATEGORY_FILTERS.find((f) => f.key === activeFilter);
    if (!filter || !filter.match) return templates;
    return templates.filter((t) => t.eventType && filter.match!.includes(t.eventType));
  }, [templates, activeFilter]);

  return (
    <section id="template" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
        Template undangan siap pakai
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
        Pilih salah satu, atau jadikan titik awal lalu sesuaikan lewat
        Invitation Builder — semua bisa diubah warna, font, dan isi
        sectionnya.
      </p>

      {/* Filter kategori */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              activeFilter === f.key
                ? "border-forest-600 bg-forest-600 text-white"
                : "border-champagne-200 text-slate-600 hover:border-forest-300 hover:text-forest-700",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href="/register"
              className="group overflow-hidden rounded-lg border border-champagne-100 bg-white shadow-soft transition hover:shadow-medium"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-champagne-50">
                <img
                  src={t.thumbnailUrl}
                  alt={t.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {t.isPremium && (
                  <span className="absolute right-3 top-3 rounded-full bg-champagne-500 px-3 py-1 text-xs font-medium text-forest-900 shadow-soft">
                    Premium
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-heading text-base font-medium text-forest-700">{t.name}</p>
                {t.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-slate-500">
          Belum ada template untuk kategori ini. Coba kategori lain, atau lihat semua template.
        </p>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Lebih banyak template tersedia langsung di dalam Invitation Builder setelah Anda mendaftar.
      </p>
    </section>
  );
}

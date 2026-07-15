"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_LIBRARY, SECTION_TYPES, type SectionType } from "@/lib/invitation-sections";

interface AddSectionDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: SectionType) => void;
  /** type section yang sudah dipakai dan bersifat singleton (tidak boleh dobel) */
  usedSingletons: Set<SectionType>;
}

const CATEGORY_ORDER = ["Pembuka", "Inti", "Cerita", "Media", "Interaksi", "Penutup"] as const;

// BAB 10.3 — "Ditambah". Panel ini menyediakan seluruh Section Library
// (BAB 10.5) yang dikelompokkan sesuai perannya dalam undangan.
export function AddSectionDrawer({ open, onClose, onAdd, usedSingletons }: AddSectionDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest-900/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-white shadow-floating animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-champagne-100 px-5 py-4">
          <div>
            <p className="font-heading text-base font-semibold text-forest-700">Tambah Section</p>
            <p className="text-xs text-slate-500">Pilih blok yang ingin ditambahkan ke undangan.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-champagne-50 hover:text-forest-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {CATEGORY_ORDER.map((category) => {
            const items = SECTION_TYPES.map((t) => SECTION_LIBRARY[t]).filter((m) => m.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-champagne-600">{category}</p>
                <div className="space-y-2">
                  {items.map((meta) => {
                    const disabled = meta.singleton && usedSingletons.has(meta.type);
                    return (
                      <button
                        key={meta.type}
                        disabled={disabled}
                        onClick={() => !disabled && onAdd(meta.type)}
                        className={cn(
                          "w-full rounded-md border border-champagne-100 px-3 py-2.5 text-left transition",
                          disabled
                            ? "cursor-not-allowed opacity-40"
                            : "hover:border-forest-300 hover:bg-forest-50",
                        )}
                      >
                        <p className="text-sm font-medium text-forest-700">{meta.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{meta.description}</p>
                        {disabled && <p className="mt-1 text-xs italic text-champagne-600">Sudah ada di undangan</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

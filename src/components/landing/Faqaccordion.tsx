"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// BAB 6.3.12 — FAQ. Pertanyaan yang paling sering diajukan, disajikan
// sebagai accordion (client component karena butuh state buka/tutup).
// Aksesibilitas (BAB 6.9): tombol pakai aria-expanded & aria-controls.
const faqs = [
  {
    q: "Apakah bisa gratis?",
    a: "Bisa. Paket Basic memungkinkan Anda membuat satu acara secara gratis dengan fitur inti seperti undangan, guest management, dan RSVP.",
  },
  {
    q: "Bagaimana cara RSVP?",
    a: "Tamu cukup membuka link undangan yang dikirim lewat WhatsApp, lalu mengisi form RSVP langsung dari halaman tersebut — tanpa perlu instal aplikasi.",
  },
  {
    q: "Apakah bisa custom domain?",
    a: "Bisa, tersedia untuk paket Premium dan Ultimate. Anda dapat menghubungkan domain sendiri ke halaman undangan acara Anda.",
  },
  {
    q: "Apakah bisa digunakan selain pernikahan?",
    a: "Tentu. Selain pernikahan, Selalu Ajak mendukung ulang tahun, lamaran, wisuda, seminar, gathering, hingga acara korporat.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
        Pertanyaan yang sering diajukan
      </h2>

      <div className="mt-10 divide-y divide-champagne-100 rounded-lg border border-champagne-100 bg-white shadow-soft">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-medium text-forest-700">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-champagne-600 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                className={cn("grid transition-all", isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]")}
                style={{ display: "grid" }}
              >
                <div className="overflow-hidden px-6">
                  <p className="text-sm text-slate-600">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

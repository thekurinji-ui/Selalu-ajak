"use client";

import { SectionRenderer, type InvitationEventContext } from "@/components/invitation/SectionRenderer";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";
import type { SectionInstance } from "@/lib/invitation-sections";

// BAB Template Management — Preview admin. Dipakai supaya admin bisa lihat
// hasil `defaultSections` sebagai undangan sungguhan, sebelum fitur "pilih
// template" untuk user selesai dibangun. Pakai SectionRenderer & ThemeProvider
// yang PERSIS sama dengan Invitation Builder & halaman publik /i/[slug],
// jadi apa yang kelihatan di sini = apa yang bakal dilihat user nanti.
export function TemplatePreviewCanvas({
  sections,
  templateName,
  primaryColor,
  themeId,
}: {
  sections: SectionInstance[];
  templateName: string;
  primaryColor?: string | null;
  /** InvitationTemplate.defaultThemeId — preset tema (warna+font) yang sebenarnya
   * dipilih admin saat upload template. Kalau tidak dikirim, fallback "elegant". */
  themeId?: string | null;
}) {
  const visibleSections = sections.filter((s) => s.visible);

  // Event fiktif — template belum terpasang ke acara sungguhan mana pun,
  // jadi tanggal/lokasi/RSVP/digital gift memang belum ada datanya. Section
  // yang butuh data itu (event_info, countdown, maps, digital_gift) akan
  // tampil dengan placeholder kosong, bukan error.
  const fakeEvent: InvitationEventContext = {
    name: templateName,
    date: null,
    location: null,
    address: null,
    description: null,
    coverImageUrl: null,
    digitalGift: null,
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900 px-6 py-10">
      <div className="w-[390px] max-w-full overflow-hidden rounded-lg border-8 border-slate-800 bg-ivory shadow-2xl">
        <ThemeProvider
          theme={{ theme: themeId || "elegant", primaryColor, secondaryColor: null, backgroundColor: null, fontId: null }}
        >
          {visibleSections.length === 0 ? (
            <div className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
              <p className="font-heading text-lg text-theme-primary">Template ini belum punya section.</p>
            </div>
          ) : (
            visibleSections.map((section) => (
              <SectionRenderer key={section.id} section={section} event={fakeEvent} mode="preview" />
            ))
          )}
        </ThemeProvider>
      </div>
      <p className="max-w-[390px] text-center text-xs text-slate-500">
        Preview read-only. Tanggal, lokasi, RSVP, dan digital gift masih placeholder karena template ini belum
        terpasang ke acara sungguhan mana pun.
      </p>
    </div>
  );
}

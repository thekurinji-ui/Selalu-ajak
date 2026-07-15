"use client";

import { cn } from "@/lib/utils";
import { SectionRenderer, type InvitationEventContext } from "@/components/invitation/SectionRenderer";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";
import type { SectionInstance } from "@/lib/invitation-sections";
import type { EventThemeFields } from "@/lib/invitation-themes";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

interface PreviewCanvasProps {
  sections: SectionInstance[];
  event: InvitationEventContext;
  theme: EventThemeFields;
  device: PreviewDevice;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// BAB 10.8 — Live Preview. Setiap perubahan pada state builder — termasuk
// perubahan tema (BAB 10.6) — langsung tercermin di sini tanpa perlu
// simpan/refresh, dibungkus ThemeProvider yang sama dengan halaman publik
// /i/[slug] supaya hasilnya selalu identik.
export function PreviewCanvas({ sections, event, theme, device, selectedId, onSelect }: PreviewCanvasProps) {
  const visibleSections = sections.filter((s) => s.visible);

  return (
    <div className="flex h-full items-start justify-center overflow-y-auto bg-champagne-50/40 px-6 py-8">
      <div
        className={cn(
          "min-h-[600px] overflow-hidden rounded-lg bg-ivory shadow-floating transition-all duration-300",
          device !== "desktop" && "border-8 border-forest-900/80",
        )}
        style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
      >
        <ThemeProvider theme={theme} className="min-h-[600px]">
          {visibleSections.length === 0 ? (
            <div className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
              <p className="font-heading text-lg text-theme-primary">Undangan masih kosong</p>
              <p className="mt-2 text-sm text-theme-muted">Tambahkan section dari panel kiri untuk mulai membangun undangan.</p>
            </div>
          ) : (
            sections.map(
              (section) =>
                section.visible && (
                  <div
                    key={section.id}
                    onClick={() => onSelect(section.id)}
                    className={cn(
                      "cursor-pointer transition",
                      selectedId === section.id && "ring-2 ring-inset ring-forest-500",
                    )}
                  >
                    <SectionRenderer section={section} event={event} mode="preview" />
                  </div>
                ),
            )
          )}
        </ThemeProvider>
      </div>
    </div>
  );
}

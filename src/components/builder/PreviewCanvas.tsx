"use client";

import { cn } from "@/lib/utils";
import { SectionRenderer, type InvitationEventContext } from "@/components/invitation/SectionRenderer";
import type { SectionInstance } from "@/lib/invitation-sections";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

interface PreviewCanvasProps {
  sections: SectionInstance[];
  event: InvitationEventContext;
  device: PreviewDevice;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// BAB 10.8 — Live Preview. Setiap perubahan pada state builder langsung
// tercermin di sini tanpa perlu simpan/refresh.
export function PreviewCanvas({ sections, event, device, selectedId, onSelect }: PreviewCanvasProps) {
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
        {visibleSections.length === 0 ? (
          <div className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">
            <p className="font-heading text-lg text-forest-700">Undangan masih kosong</p>
            <p className="mt-2 text-sm text-slate-400">Tambahkan section dari panel kiri untuk mulai membangun undangan.</p>
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
      </div>
    </div>
  );
}

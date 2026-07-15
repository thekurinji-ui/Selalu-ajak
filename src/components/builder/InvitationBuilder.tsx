"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Tablet, Smartphone, ExternalLink, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTION_LIBRARY,
  createSectionInstance,
  createSectionId,
  type SectionInstance,
  type SectionType,
} from "@/lib/invitation-sections";
import { LayersPanel } from "@/components/builder/LayersPanel";
import { AddSectionDrawer } from "@/components/builder/AddSectionDrawer";
import { SectionSettingsPanel } from "@/components/builder/SectionSettingsPanel";
import { PreviewCanvas, type PreviewDevice } from "@/components/builder/PreviewCanvas";
import { ThemeDrawer } from "@/components/builder/ThemeDrawer";
import type { InvitationEventContext } from "@/components/invitation/SectionRenderer";
import type { EventThemeFields } from "@/lib/invitation-themes";

interface InvitationBuilderProps {
  eventId: string;
  eventSlug: string;
  initialSections: SectionInstance[];
  initialTheme: EventThemeFields;
  event: InvitationEventContext;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

// BAB 10 — Invitation Builder. Editor drag-and-drop penuh di atas kolom
// `InvitationPage.sections: Json`: tambah/hapus/pindah/duplikasi/sembunyikan
// section (10.3), Live Preview (10.8), dan Auto Save (10.9).
export function InvitationBuilder({ eventId, eventSlug, initialSections, initialTheme, event }: InvitationBuilderProps) {
  const [sections, setSections] = useState<SectionInstance[]>(initialSections);
  const [themeConfig, setThemeConfig] = useState<EventThemeFields>(initialTheme);
  const [selectedId, setSelectedId] = useState<string | null>(initialSections[0]?.id ?? null);
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedSection = useMemo(() => sections.find((s) => s.id === selectedId) ?? null, [sections, selectedId]);

  const usedSingletons = useMemo(() => {
    const set = new Set<SectionType>();
    sections.forEach((s) => {
      if (SECTION_LIBRARY[s.type].singleton) set.add(s.type);
    });
    return set;
  }, [sections]);

  const save = useCallback(
    async (next: SectionInstance[], nextTheme: EventThemeFields) => {
      setStatus("saving");
      try {
        const res = await fetch("/api/invitation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, sections: next, theme: nextTheme }),
        });
        if (!res.ok) throw new Error("Gagal menyimpan");
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [eventId],
  );

  // BAB 10.9 — Auto Save: setiap perubahan sections ATAU tema (BAB 10.6)
  // di-debounce lalu disimpan otomatis tanpa tombol simpan.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(sections, themeConfig);
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, themeConfig]);

  function updateTheme(patch: Partial<EventThemeFields>) {
    setThemeConfig((prev) => ({ ...prev, ...patch }));
  }

  function updateSectionData(id: string, data: Record<string, any>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, data } : s)));
  }

  function toggleVisible(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  }

  function duplicateSection(id: string) {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const original = prev[index];
      const copy: SectionInstance = {
        ...original,
        id: createSectionId(),
        data: structuredClone(original.data),
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  }

  function deleteSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function addSection(type: SectionType) {
    const instance = createSectionInstance(type);
    setSections((prev) => [...prev, instance]);
    setSelectedId(instance.id);
    setDrawerOpen(false);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ivory">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-champagne-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-champagne-50 hover:text-forest-700"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div className="hidden sm:block">
            <p className="font-heading text-sm font-semibold text-forest-700">{event.name}</p>
            <SaveIndicator status={status} />
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-champagne-100 p-1">
          <DeviceButton icon={Monitor} active={device === "desktop"} onClick={() => setDevice("desktop")} label="Desktop" />
          <DeviceButton icon={Tablet} active={device === "tablet"} onClick={() => setDevice("tablet")} label="Tablet" />
          <DeviceButton icon={Smartphone} active={device === "mobile"} onClick={() => setDevice("mobile")} label="Mobile" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemeDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-champagne-200 px-3 py-1.5 text-sm font-medium text-forest-700 hover:bg-champagne-50"
          >
            <Palette size={14} /> Tema
          </button>
          <Link
            href={`/i/${eventSlug}`}
            target="_blank"
            className="flex items-center gap-1 rounded-md border border-champagne-200 px-3 py-1.5 text-sm font-medium text-forest-700 hover:bg-champagne-50"
          >
            Lihat Undangan <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      <div className="block border-b border-champagne-100 bg-white px-4 py-1.5 sm:hidden">
        <SaveIndicator status={status} />
      </div>

      {/* Body: Layers | Preview | Settings */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[240px_1fr_280px]">
        <div className="hidden border-r border-champagne-100 bg-white md:block">
          <LayersPanel
            sections={sections}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={setSections}
            onToggleVisible={toggleVisible}
            onDuplicate={duplicateSection}
            onDelete={deleteSection}
            onOpenAddSection={() => setDrawerOpen(true)}
          />
        </div>

        <PreviewCanvas
          sections={sections}
          event={event}
          theme={themeConfig}
          device={device}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <div className="hidden border-l border-champagne-100 bg-white lg:block">
          <SectionSettingsPanel section={selectedSection} onChange={updateSectionData} />
        </div>
      </div>

      {/* Panel layer & settings versi mobile, ditumpuk di bawah preview */}
      <div className="grid grid-cols-2 divide-x divide-champagne-100 border-t border-champagne-100 bg-white md:hidden">
        <div className="max-h-64 overflow-y-auto">
          <LayersPanel
            sections={sections}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={setSections}
            onToggleVisible={toggleVisible}
            onDuplicate={duplicateSection}
            onDelete={deleteSection}
            onOpenAddSection={() => setDrawerOpen(true)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          <SectionSettingsPanel section={selectedSection} onChange={updateSectionData} />
        </div>
      </div>

      <AddSectionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={addSection}
        usedSingletons={usedSingletons}
      />

      <ThemeDrawer
        open={themeDrawerOpen}
        onClose={() => setThemeDrawerOpen(false)}
        theme={themeConfig}
        onChange={updateTheme}
      />
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const text =
    status === "saving"
      ? "Menyimpan..."
      : status === "saved"
        ? "Perubahan tersimpan."
        : status === "error"
          ? "Gagal menyimpan — periksa koneksi."
          : "";
  if (!text) return <p className="text-xs text-slate-400">&nbsp;</p>;
  return (
    <p
      className={cn(
        "text-xs",
        status === "saving" && "text-champagne-600",
        status === "saved" && "text-forest-500",
        status === "error" && "text-danger",
      )}
    >
      {text}
    </p>
  );
}

function DeviceButton({
  icon: Icon,
  active,
  onClick,
  label,
}: {
  icon: typeof Monitor;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "rounded px-2.5 py-1.5 transition",
        active ? "bg-forest-600 text-white" : "text-slate-400 hover:bg-champagne-50 hover:text-forest-700",
      )}
    >
      <Icon size={16} />
    </button>
  );
}

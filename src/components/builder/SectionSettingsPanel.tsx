"use client";

import { SECTION_LIBRARY, type SectionInstance } from "@/lib/invitation-sections";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface SectionSettingsPanelProps {
  section: SectionInstance | null;
  onChange: (id: string, data: Record<string, any>) => void;
}

// BAB 10.5 — pengaturan tiap section. BAB 10.7 — Customization tanpa kode:
// semua field di sini langsung memengaruhi Live Preview.
export function SectionSettingsPanel({ section, onChange }: SectionSettingsPanelProps) {
  if (!section) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
        Pilih salah satu section di panel kiri untuk mengatur isinya.
      </div>
    );
  }

  const meta = SECTION_LIBRARY[section.type];
  const set = (patch: Record<string, any>) => onChange(section.id, { ...section.data, ...patch });

  return (
    <div className="h-full overflow-y-auto p-5">
      <p className="font-heading text-sm font-semibold text-forest-700">{meta.label}</p>
      <p className="mt-1 text-xs text-slate-500">{meta.description}</p>

      <div className="mt-5 space-y-4">
        <Fields section={section} set={set} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Fields({ section, set }: { section: SectionInstance; set: (patch: Record<string, any>) => void }) {
  const d = section.data;

  switch (section.type) {
    case "cover":
      return (
        <>
          <Field label="URL Foto Utama">
            <Input value={d.photoUrl || ""} onChange={(e) => set({ photoUrl: e.target.value })} placeholder="https://..." />
          </Field>
          <Field label="Judul Acara">
            <Input value={d.eventTitle || ""} onChange={(e) => set({ eventTitle: e.target.value })} placeholder="Kosongkan untuk pakai nama acara" />
          </Field>
          <Field label="Nama Penyelenggara">
            <Input value={d.hostName || ""} onChange={(e) => set({ hostName: e.target.value })} />
          </Field>
          <Field label="Label Tombol">
            <Input value={d.openButtonLabel || ""} onChange={(e) => set({ openButtonLabel: e.target.value })} />
          </Field>
        </>
      );

    case "opening_message":
      return (
        <>
          <Field label="Kutipan">
            <Input value={d.quote || ""} onChange={(e) => set({ quote: e.target.value })} />
          </Field>
          <Field label="Pesan Pembuka">
            <Textarea value={d.message || ""} onChange={(v) => set({ message: v })} />
          </Field>
        </>
      );

    case "couple": {
      const members: any[] = d.members || [];
      return (
        <>
          {members.map((m, i) => (
            <div key={i} className="space-y-3 rounded-md border border-champagne-100 p-3">
              <p className="text-xs font-semibold text-champagne-600">Mempelai {i + 1}</p>
              <Field label="Nama">
                <Input value={m.name || ""} onChange={(e) => updateArrayItem(members, i, { name: e.target.value }, set, "members")} />
              </Field>
              <Field label="URL Foto">
                <Input value={m.photoUrl || ""} onChange={(e) => updateArrayItem(members, i, { photoUrl: e.target.value }, set, "members")} />
              </Field>
              <Field label="Orang Tua">
                <Input value={m.parents || ""} onChange={(e) => updateArrayItem(members, i, { parents: e.target.value }, set, "members")} />
              </Field>
              <Field label="Deskripsi Singkat">
                <Textarea value={m.description || ""} onChange={(v) => updateArrayItem(members, i, { description: v }, set, "members")} />
              </Field>
            </div>
          ))}
        </>
      );
    }

    case "event_info":
      return (
        <Field label="Dress Code (opsional)">
          <Input value={d.dressCode || ""} onChange={(e) => set({ dressCode: e.target.value })} placeholder="Formal / Batik / dst." />
        </Field>
      );

    case "countdown":
      return <p className="text-xs text-slate-400">Countdown mengikuti tanggal &amp; jam acara secara otomatis.</p>;

    case "story":
      return (
        <>
          <Field label="Judul">
            <Input value={d.title || ""} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Isi Cerita">
            <Textarea value={d.body || ""} onChange={(v) => set({ body: v })} rows={6} />
          </Field>
        </>
      );

    case "timeline": {
      const items: any[] = d.items || [];
      return (
        <ListEditor
          items={items}
          onChange={(next) => set({ items: next })}
          addLabel="Tambah Kegiatan"
          empty={{ time: "", title: "", description: "" }}
          renderItem={(it, i, update) => (
            <>
              <Field label="Jam">
                <Input value={it.time || ""} onChange={(e) => update({ time: e.target.value })} placeholder="10.00" />
              </Field>
              <Field label="Nama Kegiatan">
                <Input value={it.title || ""} onChange={(e) => update({ title: e.target.value })} placeholder="Akad Nikah" />
              </Field>
              <Field label="Deskripsi">
                <Input value={it.description || ""} onChange={(e) => update({ description: e.target.value })} />
              </Field>
            </>
          )}
        />
      );
    }

    case "gallery":
      return (
        <>
          <Field label="Tampilan">
            <select
              value={d.layout || "grid"}
              onChange={(e) => set({ layout: e.target.value })}
              className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm"
            >
              <option value="grid">Grid</option>
              <option value="masonry">Masonry</option>
              <option value="carousel">Carousel</option>
            </select>
          </Field>
          <SimpleUrlListEditor
            label="Foto"
            urls={d.images || []}
            onChange={(next) => set({ images: next })}
          />
        </>
      );

    case "video":
      return (
        <>
          <Field label="Provider">
            <select
              value={d.provider || "youtube"}
              onChange={(e) => set({ provider: e.target.value })}
              className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
            </select>
          </Field>
          <Field label="URL Embed">
            <Input value={d.videoUrl || ""} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
          </Field>
        </>
      );

    case "maps":
      return (
        <>
          <Field label="Nama Venue">
            <Input value={d.venueName || ""} onChange={(e) => set({ venueName: e.target.value })} />
          </Field>
          <Field label="URL Google Maps">
            <Input value={d.mapsUrl || ""} onChange={(e) => set({ mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
          </Field>
        </>
      );

    case "rsvp":
      return <p className="text-xs text-slate-400">Formulir RSVP baku sesuai BAB 12. Aktif/nonaktifkan lewat ikon mata di panel Sections.</p>;

    case "digital_gift":
      return <p className="text-xs text-slate-400">Metode hadiah digital diatur di menu Digital Gift pada workspace acara.</p>;

    case "wishes":
      return <p className="text-xs text-slate-400">Ucapan tamu tampil otomatis setelah undangan dipublikasikan.</p>;

    case "footer":
      return (
        <Field label="Pesan Penutup">
          <Textarea value={d.closingMessage || ""} onChange={(v) => set({ closingMessage: v })} />
        </Field>
      );

    default:
      return null;
  }
}

function updateArrayItem(
  arr: any[],
  index: number,
  patch: Record<string, any>,
  set: (patch: Record<string, any>) => void,
  key: string,
) {
  const next = [...arr];
  next[index] = { ...next[index], ...patch };
  set({ [key]: next });
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
    />
  );
}

function ListEditor({
  items,
  onChange,
  renderItem,
  addLabel,
  empty,
}: {
  items: any[];
  onChange: (next: any[]) => void;
  renderItem: (item: any, index: number, update: (patch: Record<string, any>) => void) => React.ReactNode;
  addLabel: string;
  empty: Record<string, any>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border border-champagne-100 p-3">
          {renderItem(item, i, (patch) => {
            const next = [...items];
            next[i] = { ...next[i], ...patch };
            onChange(next);
          })}
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="flex items-center gap-1 text-xs text-danger hover:underline"
          >
            <Trash2 size={12} /> Hapus
          </button>
        </div>
      ))}
      <Button variant="ghost" className="w-full" onClick={() => onChange([...items, empty])}>
        <Plus size={14} className="mr-1" /> {addLabel}
      </Button>
    </div>
  );
}

function SimpleUrlListEditor({
  label,
  urls,
  onChange,
}: {
  label: string;
  urls: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <div className="space-y-2">
        {urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => {
                const next = [...urls];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder="https://..."
            />
            <button
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="rounded-md border border-champagne-200 px-2 text-slate-400 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <Button variant="ghost" className="w-full" onClick={() => onChange([...urls, ""])}>
          <Plus size={14} className="mr-1" /> Tambah Foto
        </Button>
      </div>
    </div>
  );
}

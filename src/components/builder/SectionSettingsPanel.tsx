"use client";

import { useEffect, useRef, useState } from "react";
import { SECTION_LIBRARY, type SectionInstance } from "@/lib/invitation-sections";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, UploadCloud, Loader2, X } from "lucide-react";

interface SectionSettingsPanelProps {
  eventId: string;
  section: SectionInstance | null;
  onChange: (id: string, data: Record<string, any>) => void;
}

// BAB 10.5 — pengaturan tiap section. BAB 10.7 — Customization tanpa kode:
// semua field di sini langsung memengaruhi Live Preview.
export function SectionSettingsPanel({ eventId, section, onChange }: SectionSettingsPanelProps) {
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
        <Fields eventId={eventId} section={section} set={set} />
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

function Fields({
  eventId,
  section,
  set,
}: {
  eventId: string;
  section: SectionInstance;
  set: (patch: Record<string, any>) => void;
}) {
  const d = section.data;

  switch (section.type) {
    case "cover":
      return (
        <>
          <ImageUploadField
            eventId={eventId}
            label="Foto Utama"
            value={d.photoUrl || ""}
            onChange={(url) => set({ photoUrl: url })}
          />
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
              <ImageUploadField
                eventId={eventId}
                label="Foto"
                value={m.photoUrl || ""}
                onChange={(url) => updateArrayItem(members, i, { photoUrl: url }, set, "members")}
              />
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
          <ImageGalleryUploadField
            eventId={eventId}
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

// Upload satu file ke server lalu kembalikan URL publik R2-nya.
// Dipakai bersama oleh ImageUploadField & ImageGalleryUploadField.
async function uploadEventImage(eventId: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.set("eventId", eventId);
  formData.set("file", file);

  const res = await fetch("/api/invitation/upload-image", { method: "POST", body: formData });
  const json = await res.json().catch(() => null);

  if (!res.ok || json?.status !== "success") {
    throw new Error(json?.message ?? "Gagal upload foto. Coba lagi.");
  }
  return json.url as string;
}

// Field upload foto tunggal (cover, foto mempelai, dst). Klien upload
// langsung dari device — tidak perlu tempel link dari luar lagi.
function ImageUploadField({
  eventId,
  label,
  value,
  onChange,
}: {
  eventId: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);
    setUploading(true);

    try {
      const url = await uploadEventImage(eventId, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto.");
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <label className="relative flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-champagne-200 bg-champagne-50/60 hover:border-forest-400">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <UploadCloud size={20} />
            <span className="text-[11px]">Tap untuk upload foto</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">JPG, PNG, WEBP, GIF. Maks 5MB.</span>
        {preview && !uploading && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onChange("");
            }}
            className="text-[11px] text-danger hover:underline"
          >
            Hapus
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

// Grid upload multi-foto untuk section Galeri. Bisa pilih banyak file
// sekaligus; masing-masing diupload lalu ditambahkan ke daftar `images`.
function ImageGalleryUploadField({
  eventId,
  label,
  urls,
  onChange,
}: {
  eventId: string;
  label: string;
  urls: string[];
  onChange: (next: string[]) => void;
}) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const files = Array.from(fileList);
    setUploadingCount((c) => c + files.length);

    // Akumulator lokal — bukan langsung pakai `urls` dari props di tiap
    // iterasi, karena itu stale-closure sampai parent re-render. Kalau
    // beberapa file diupload sekaligus, itu bisa bikin hasil upload
    // sebelumnya ketimpa alih-alih terkumpul.
    let current = urls;
    for (const file of files) {
      try {
        const url = await uploadEventImage(eventId, file);
        current = [...current, url];
        onChange(current);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sebagian foto gagal diupload.");
      } finally {
        setUploadingCount((c) => c - 1);
      }
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-champagne-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-champagne-200 text-slate-400 hover:border-forest-400">
          <Plus size={16} />
          <span className="text-[10px]">Tambah</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      {uploadingCount > 0 && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-champagne-600">
          <Loader2 size={12} className="animate-spin" /> Mengupload {uploadingCount} foto...
        </p>
      )}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

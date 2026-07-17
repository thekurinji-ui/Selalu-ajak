"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, Loader2 } from "lucide-react";
import { THEME_PRESETS } from "@/lib/invitation-themes";

// BAB Template Management — form ini dipakai untuk 2 mode:
// - Create: /admin/templates/new            (initialData kosong)
// - Edit:   /admin/templates/[id]/edit       (initialData terisi dari DB)
type TemplateFormInitialData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  eventType: string | null;
  primaryColor: string | null;
  defaultThemeId: string;
  isPremium: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl: string;
  defaultSections: unknown;
};

const EVENT_TYPES = [
  "PERNIKAHAN", "LAMARAN", "TUNANGAN", "ULANG_TAHUN", "WISUDA", "AQIQAH",
  "TASYAKURAN", "SEMINAR", "WORKSHOP", "GATHERING", "CORPORATE_EVENT",
  "PELUNCURAN_PRODUK", "KONFERENSI", "REUNI", "KOMUNITAS", "LAINNYA",
];

const DEFAULT_SECTIONS_PLACEHOLDER = JSON.stringify(
  [
    { type: "cover", title: "Cover" },
    { type: "story", title: "Cerita Kami" },
    { type: "gallery", title: "Galeri Foto" },
    { type: "rsvp", title: "Konfirmasi Kehadiran" },
  ],
  null,
  2,
);

export function TemplateForm({ initialData }: { initialData?: TemplateFormInitialData }) {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [eventType, setEventType] = useState(initialData?.eventType ?? "");
  const [defaultThemeId, setDefaultThemeId] = useState(initialData?.defaultThemeId ?? "elegant");
  const selectedPreset = THEME_PRESETS.find((p) => p.id === defaultThemeId) ?? THEME_PRESETS[0];
  const [isPremium, setIsPremium] = useState(initialData?.isPremium ?? false);
  const [status, setStatus] = useState(initialData?.status ?? "DRAFT");
  const [defaultSections, setDefaultSections] = useState(
    initialData ? JSON.stringify(initialData.defaultSections, null, 2) : DEFAULT_SECTIONS_PLACEHOLDER,
  );

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.thumbnailUrl ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    // Auto-generate slug dari nama, hanya kalau slug belum diubah manual (mode create)
    if (!isEditMode) {
      const generated = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generated);
    }
  }

  function handleFileChange(file: File | null) {
    setThumbnailFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isEditMode && !thumbnailFile) {
      setError("Gambar thumbnail wajib diupload.");
      return;
    }

    try {
      JSON.parse(defaultSections);
    } catch {
      setError("Struktur section (defaultSections) harus JSON yang valid.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    if (eventType) formData.set("eventType", eventType);
    formData.set("primaryColor", selectedPreset.colors.primary);
    formData.set("defaultThemeId", defaultThemeId);
    formData.set("isPremium", String(isPremium));
    formData.set("status", status);
    formData.set("defaultSections", defaultSections);
    if (thumbnailFile) formData.set("thumbnail", thumbnailFile);

    const url = isEditMode ? `/api/admin/templates/${initialData!.id}` : "/api/admin/templates";
    const method = isEditMode ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        setError(json.message ?? "Terjadi kesalahan, coba lagi.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/templates");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5 rounded-lg border border-slate-800 bg-slate-950 p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Nama Template</label>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Contoh: Elegant Rose Garden"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Slug</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="elegant-rose-garden"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">Huruf kecil, angka, dan tanda strip saja.</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Deskripsi</label>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Deskripsi singkat gaya template ini..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Jenis Acara</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="">Semua jenis acara</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Tema Bawaan</label>
            <div className="flex items-center gap-2">
              <span
                className="h-[38px] w-[38px] shrink-0 rounded-lg border border-slate-800"
                style={{ backgroundColor: selectedPreset.colors.primary }}
                aria-hidden
              />
              <select
                value={defaultThemeId}
                onChange={(e) => setDefaultThemeId(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {THEME_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.label}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tema ini otomatis diterapkan (warna, font) begitu user memilih template ini
              saat bikin acara — dia nggak perlu pilih tema terpisah lagi.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Struktur Section Default (JSON)
          </label>
          <textarea
            required
            value={defaultSections}
            onChange={(e) => setDefaultSections(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-xs text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Array section yang otomatis dipakai saat user pilih template ini di Invitation Builder.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Thumbnail</label>

          <label className="mt-2 flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-700 bg-slate-900 hover:border-amber-400/50">
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" width={320} height={420} className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <UploadCloud size={28} />
                <span className="text-xs">Tap untuk pilih gambar</span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">JPG, PNG, WEBP, atau GIF. Maksimal 5MB.</p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="DRAFT">Draft (belum tampil ke user)</option>
            <option value="PUBLISHED">Published (tampil ke user)</option>
            <option value="ARCHIVED">Archived (disembunyikan)</option>
          </select>

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-amber-400"
            />
            Template Premium
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-400">{error}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-amber-300 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isEditMode ? "Simpan Perubahan" : "Upload Template"}
        </button>
      </div>
    </form>
  );
}

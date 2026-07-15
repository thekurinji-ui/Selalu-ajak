"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

// BAB Template Management — tombol hapus dengan konfirmasi, dipakai di
// halaman edit template. Kalau template masih dipakai acara, tetap boleh
// dihapus (Event.templateId akan otomatis jadi null, event tidak ikut hilang).
export function DeleteTemplateButton({
  templateId,
  eventsUsingTemplate,
}: {
  templateId: string;
  eventsUsingTemplate: number;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        setError(json.message ?? "Gagal menghapus template.");
        setIsDeleting(false);
        return;
      }

      router.push("/admin/templates");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
      setIsDeleting(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-300">
          {eventsUsingTemplate > 0
            ? `Yakin hapus? ${eventsUsingTemplate} acara memakai template ini.`
            : "Yakin hapus template ini?"}
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-500 disabled:opacity-60"
        >
          {isDeleting && <Loader2 size={14} className="animate-spin" />}
          Ya, Hapus
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
        >
          Batal
        </button>
        {error && <span className="text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/40"
    >
      <Trash2 size={14} />
      Hapus Template
    </button>
  );
}

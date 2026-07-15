"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// BAB 13.6 — Tombol "Kirim Sekarang" untuk kampanye berstatus MENUNGGU.
// Memanggil POST /api/whatsapp/campaigns/[id]/send, lalu me-refresh halaman
// server component supaya tabel kampanye & status per-tamu ter-update.
export function SendCampaignButton({ campaignId, recipientCount }: { campaignId: string; recipientCount: number }) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (isSending) return;
    const confirmed = window.confirm(
      `Kirim kampanye ini ke ${recipientCount} tamu sekarang lewat WhatsApp? Aksi ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    setIsSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/whatsapp/campaigns/${campaignId}/send`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Gagal mengirim kampanye.");
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" onClick={handleSend} disabled={isSending}>
        {isSending ? "Mengirim..." : "Kirim Sekarang"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

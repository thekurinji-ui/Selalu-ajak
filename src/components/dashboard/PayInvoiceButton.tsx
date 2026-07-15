"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// BAB 18.6 — Tombol "Bayar Sekarang" untuk invoice PENDING. Alurnya:
//   1. Muat snap.js dari Midtrans (sandbox/production, lihat snapJsUrl).
//   2. Saat diklik, minta `token` Snap dari /api/billing/checkout.
//   3. Buka popup pembayaran lewat window.snap.pay(token).
//   4. Webhook /api/billing/webhook yang benar-benar mengubah status invoice
//      jadi PAID — callback di sini cuma untuk refresh UI-nya.

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export function PayInvoiceButton({
  invoiceId,
  snapJsUrl,
  clientKey,
}: {
  invoiceId: string;
  snapJsUrl: string;
  clientKey: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${snapJsUrl}"]`);
    if (existing) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = snapJsUrl;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, [snapJsUrl, clientKey]);

  async function handlePay() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.token) {
        alert(data?.error ?? "Gagal memulai pembayaran. Coba lagi sebentar.");
        setLoading(false);
        return;
      }

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: () => router.refresh(),
          onPending: () => router.refresh(),
          onError: () => {
            alert("Pembayaran gagal diproses. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: () => setLoading(false),
        });
      } else if (data.redirectUrl) {
        // Fallback kalau snap.js gagal dimuat (mis. diblok ad-blocker) —
        // redirect penuh ke halaman pembayaran Midtrans.
        window.location.href = data.redirectUrl;
      } else {
        setLoading(false);
      }
    } catch {
      alert("Gagal menghubungi server. Periksa koneksi internet kamu.");
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="primary" onClick={handlePay} disabled={loading || !scriptReady}>
      {loading ? "Memproses..." : "Bayar Sekarang"}
    </Button>
  );
}

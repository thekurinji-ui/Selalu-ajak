"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 19.5 — Lupa Password: langkah 1, minta link reset lewat email.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);

    setLoading(false);
    setSubmitted(true);
    setDevResetUrl(data?.devResetUrl ?? null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm rounded-lg border border-champagne-100 bg-white p-8 shadow-medium">
        <h1 className="font-heading text-2xl font-semibold text-forest-700">Lupa Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan email akun Anda, kami akan mengirimkan link untuk membuat password baru.
        </p>

        {submitted ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
              Kalau email tersebut terdaftar, link reset password sudah kami kirim. Silakan cek inbox
              (dan folder spam) Anda.
            </div>

            {devResetUrl && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <p className="font-medium">Mode development (RESEND_API_KEY belum diatur):</p>
                <a href={devResetUrl} className="mt-1 block break-all text-forest-700 underline">
                  {devResetUrl}
                </a>
              </div>
            )}

            <Link href="/login" className="block text-center text-sm font-medium text-forest-600 hover:underline">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
            <p className="text-center text-sm text-slate-500">
              <Link href="/login" className="font-medium text-forest-600 hover:underline">
                Kembali ke Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

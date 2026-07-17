"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 19.5 — Lupa Password: langkah 2, set password baru pakai token dari email.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    const data = await res.json().catch(() => null);

    setLoading(false);

    if (!res.ok) {
      setError(data?.message ?? "Gagal mereset password.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
        <div className="w-full max-w-sm rounded-lg border border-champagne-100 bg-white p-8 text-center shadow-medium">
          <p className="text-sm text-slate-600">Link reset password tidak valid.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-forest-600 hover:underline">
            Minta link reset baru
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm rounded-lg border border-champagne-100 bg-white p-8 shadow-medium">
        <h1 className="font-heading text-2xl font-semibold text-forest-700">Buat Password Baru</h1>
        <p className="mt-1 text-sm text-slate-500">Masukkan password baru untuk akun Anda.</p>

        {success ? (
          <div className="mt-6 rounded-md border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
            Password berhasil diubah. Mengarahkan ke halaman login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
              <Input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
              <Input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

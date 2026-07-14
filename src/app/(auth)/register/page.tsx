"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Terjadi kesalahan.");
      setLoading(false);
      return;
    }

    // Langsung login setelah registrasi berhasil (BAB 7.14 — Authentication Flow)
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm rounded-lg border border-champagne-100 bg-white p-8 shadow-medium">
        <h1 className="font-heading text-2xl font-semibold text-forest-700">Buat Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Mulai perjalanan acara Anda bersama Selalu Ajak.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" />
          </div>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Buat Acara Gratis"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-forest-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}

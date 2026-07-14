import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// BAB 8.14 — Settings (Acara) & BAB 19 — Account & User Management
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Pengaturan</h1>
      <div className="mt-6 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
        <p className="text-sm text-slate-500">Nama</p>
        <p className="font-medium text-slate-800">{session.user.name}</p>
        <p className="mt-4 text-sm text-slate-500">Email</p>
        <p className="font-medium text-slate-800">{session.user.email}</p>
        <p className="mt-6 text-xs text-slate-400">
          Pengaturan lengkap (ubah password, domain kustom, notifikasi) akan hadir pada
          iterasi Phase 2 sesuai roadmap BAB 29.
        </p>
      </div>
    </div>
  );
}

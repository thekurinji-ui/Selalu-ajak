import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatDateID, cn } from "@/lib/utils";

// BAB 21.5 — Event Management
// "Admin tidak dapat mengubah isi acara tanpa izin atau mekanisme yang sesuai" —
// jadi halaman ini sengaja read-only, hanya untuk pemantauan.
export default async function AdminEventsPage() {
  await requireAdmin();

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { guests: true } },
    },
  });

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-slate-700/40 text-slate-300",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400",
    ARCHIVED: "bg-slate-800 text-slate-500",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-white">Acara</h1>
      <p className="mt-1 text-sm text-slate-400">
        Seluruh acara yang dibuat pengguna (read-only, sesuai BAB 21.5).
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Acara</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Pemilik</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tamu</th>
              <th className="px-4 py-3">Tanggal Acara</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Belum ada acara.
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-900 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{e.name}</td>
                <td className="px-4 py-3">{e.type}</td>
                <td className="px-4 py-3">
                  <p>{e.user.name}</p>
                  <p className="text-xs text-slate-500">{e.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[e.status])}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3">{e._count.guests}</td>
                <td className="px-4 py-3 text-slate-500">{e.date ? formatDateID(e.date) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">Menampilkan 100 acara terbaru.</p>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { formatDateID } from "@/lib/utils";

// BAB 21.11 — Audit Log: seluruh aktivitas administrator dicatat.
export default async function AdminAuditLogPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-white">Audit Log</h1>
      <p className="mt-1 text-sm text-slate-400">
        Riwayat aksi administratif — login, perubahan data, langganan, dan publikasi konten.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Aksi</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-900 last:border-0">
                <td className="px-4 py-3 text-slate-500">{formatDateID(log.createdAt)}</td>
                <td className="px-4 py-3">{log.user?.name ?? "Sistem"}</td>
                <td className="px-4 py-3 font-mono text-xs text-amber-400">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {log.metadata ? JSON.stringify(log.metadata) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">Menampilkan 100 aktivitas terbaru.</p>
    </div>
  );
}

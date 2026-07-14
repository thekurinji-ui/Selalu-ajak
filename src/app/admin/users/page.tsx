import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin, logAdminAction } from "@/lib/admin";
import { formatDateID, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

// BAB 21.4 — User Management
async function toggleActive(formData: FormData) {
  "use server";
  const session = await requireSuperAdmin();

  const userId = formData.get("userId") as string;
  const nextState = formData.get("nextState") === "true";

  await prisma.user.update({ where: { id: userId }, data: { isActive: nextState } });
  await logAdminAction(session.user.id, nextState ? "user.activate" : "user.deactivate", { userId });
}

async function changeRole(formData: FormData) {
  "use server";
  const session = await requireSuperAdmin();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAdminAction(session.user.id, "user.change_role", { userId, role });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();

  const q = searchParams.q?.trim();
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { _count: { select: { events: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-white">Pengguna</h1>
      <p className="mt-1 text-sm text-slate-400">Kelola akun pengguna platform.</p>

      <form className="mt-6 max-w-sm" action="/admin/users">
        <Input name="q" defaultValue={q} placeholder="Cari nama atau email..." />
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Peran</th>
              <th className="px-4 py-3">Acara</th>
              <th className="px-4 py-3">Bergabung</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-900 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <form action={changeRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    >
                      {["USER", "ADMIN", "SUPPORT", "FINANCE", "CONTENT_MANAGER", "DEVELOPER"].map(
                        (r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ),
                      )}
                    </select>
                    <button type="submit" className="text-xs text-amber-400 underline">
                      Ubah
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">{u._count.events}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateID(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      u.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
                    )}
                  >
                    {u.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={toggleActive}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="nextState" value={(!u.isActive).toString()} />
                    <Button type="submit" variant="ghost" className="!px-3 !py-1 text-xs">
                      {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Menampilkan maksimal 50 pengguna terbaru. Penghapusan akun permanen belum tersedia di sini —
        gunakan proses manual sesuai kebijakan (BAB 21.4) untuk menghindari penghapusan tidak sengaja.
      </p>
    </div>
  );
}

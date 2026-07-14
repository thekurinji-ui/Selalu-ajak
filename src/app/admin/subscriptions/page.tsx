import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSuperAdmin, logAdminAction } from "@/lib/admin";
import { PLANS } from "@/lib/plans";
import { formatDateID, formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Plan } from "@prisma/client";

// BAB 21.6 — Subscription Management
async function manualUpgrade(formData: FormData) {
  "use server";
  const session = await requireSuperAdmin();

  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as Plan;

  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + 30);

  await prisma.subscription.update({
    where: { userId },
    data: { plan, status: "ACTIVE", startDate: new Date(), endDate: newEndDate },
  });

  await logAdminAction(session.user.id, "subscription.manual_upgrade", { userId, plan });
}

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const revenueAgg = await prisma.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400",
    PAST_DUE: "bg-amber-500/10 text-amber-400",
    CANCELED: "bg-slate-800 text-slate-500",
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-white">Langganan</h1>
      <p className="mt-1 text-sm text-slate-400">
        Total pendapatan (transaksi berhasil): {formatRupiah(revenueAgg._sum.amount ?? 0)}
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Paket</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Berakhir</th>
              <th className="px-4 py-3">Upgrade Manual</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id} className="border-b border-slate-900 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{s.user.name}</p>
                  <p className="text-xs text-slate-500">{s.user.email}</p>
                </td>
                <td className="px-4 py-3">{PLANS[s.plan].label}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[s.status])}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {s.endDate ? formatDateID(s.endDate) : "-"}
                </td>
                <td className="px-4 py-3">
                  <form action={manualUpgrade} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={s.userId} />
                    <select
                      name="plan"
                      defaultValue={s.plan}
                      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    >
                      {Object.values(PLANS).map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="ghost" className="!px-3 !py-1 text-xs">
                      Terapkan
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Upgrade manual di sini langsung mengaktifkan paket tanpa invoice pembayaran — dicatat di
        Audit Log (BAB 21.6 &amp; 21.11). Hanya Super Admin yang bisa melakukan ini.
      </p>
    </div>
  );
}

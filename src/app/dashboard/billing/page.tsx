import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventUsage } from "@/lib/subscription";
import { PLANS, PLAN_ORDER, PLAN_FEATURES } from "@/lib/plans";
import { formatDateID, formatRupiah, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PayInvoiceButton } from "@/components/dashboard/PayInvoiceButton";
import { isMidtransConfigured, midtransSnapJsUrl } from "@/lib/midtrans";
import { createNotification } from "@/lib/notifications";
import type { Plan } from "@prisma/client";

// BAB 18 — Subscription & Billing
//
// Pembayaran sungguhan (Virtual Account, QRIS, Kartu Kredit/Debit, E-Wallet
// — BAB 18.6) lewat Midtrans Snap aktif otomatis begitu `MIDTRANS_SERVER_KEY`
// terisi di environment (lihat `isMidtransConfigured()` & `PayInvoiceButton`).
// Kalau environment tertentu belum diisi kunci Midtrans (mis. development
// lokal), halaman ini jatuh ke tombol "Simulasikan Pembayaran Berhasil" yang
// menggantikan webhook payment gateway, supaya alur end-to-end tetap bisa
// dites tanpa akun Midtrans.

async function requestUpgrade(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const targetPlan = formData.get("plan") as Plan;
  if (!PLANS[targetPlan]) return;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!subscription) return;

  await prisma.invoice.create({
    data: {
      userId: session.user.id,
      subscriptionId: subscription.id,
      plan: targetPlan,
      amount: PLANS[targetPlan].price,
      status: "PENDING",
    },
  });

  redirect("/dashboard/billing");
}

async function markInvoicePaid(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const invoiceId = formData.get("invoiceId") as string;
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: session.user.id },
  });
  if (!invoice || invoice.status !== "PENDING") return;

  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + 30);

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "PAID", paymentMethod: invoice.paymentMethod ?? "QRIS (simulasi)" },
    }),
    prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        plan: invoice.plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: newEndDate,
      },
    }),
  ]);

  await createNotification({
    userId: session.user.id,
    category: "subscription",
    title: "Pembayaran berhasil",
    body: `Pembayaran paket ${PLANS[invoice.plan].label} berhasil (simulasi). Langganan Anda aktif hingga ${newEndDate.toLocaleDateString("id-ID")}.`,
  });

  redirect("/dashboard/billing");
}

async function cancelInvoice(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const invoiceId = formData.get("invoiceId") as string;
  await prisma.invoice.updateMany({
    where: { id: invoiceId, userId: session.user.id, status: "PENDING" },
    data: { status: "FAILED" },
  });

  redirect("/dashboard/billing");
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-forest-50 text-forest-700",
  PAST_DUE: "bg-amber-50 text-amber-700",
  CANCELED: "bg-slate-100 text-slate-500",
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-forest-50 text-forest-700",
  FAILED: "bg-red-50 text-red-600",
  EXPIRED: "bg-slate-100 text-slate-500",
  REFUNDED: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Aktif",
  PAST_DUE: "Jatuh Tempo",
  CANCELED: "Dibatalkan",
  PENDING: "Menunggu Pembayaran",
  PAID: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  REFUNDED: "Dikembalikan",
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { subscription, plan, usedEvents } = await getEventUsage(session.user.id);

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const pendingInvoice = invoices.find((inv) => inv.status === "PENDING");

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Billing &amp; Langganan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kelola paket, penggunaan, dan riwayat pembayaran akun kamu.
      </p>

      {/* BAB 18.7 — Dashboard Billing: Paket aktif, status, tanggal, tombol upgrade/perpanjang */}
      <section className="mt-6 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-champagne-600">Paket Aktif</p>
            <p className="mt-1 font-heading text-2xl font-semibold text-forest-700">{plan.label}</p>
            <span
              className={cn(
                "mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium",
                statusStyles[subscription.status],
              )}
            >
              {statusLabel[subscription.status]}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            <p>Mulai: {formatDateID(subscription.startDate)}</p>
            <p>
              Berakhir:{" "}
              {subscription.endDate ? formatDateID(subscription.endDate) : "Tidak ada batas (Gratis)"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Penggunaan Acara</span>
            <span>
              {usedEvents} / {plan.maxEvents} acara
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full rounded-full bg-champagne-50">
            <div
              className={cn(
                "h-2 rounded-full",
                usedEvents >= plan.maxEvents ? "bg-red-400" : "bg-forest-500",
              )}
              style={{ width: `${Math.min(100, (usedEvents / plan.maxEvents) * 100)}%` }}
            />
          </div>
        </div>

        {pendingInvoice && (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              Ada pembayaran menunggu untuk paket {PLANS[pendingInvoice.plan].label} sebesar{" "}
              {formatRupiah(pendingInvoice.amount)}.
            </p>
            <div className="mt-3 flex gap-2">
              {isMidtransConfigured() ? (
                <PayInvoiceButton
                  invoiceId={pendingInvoice.id}
                  snapJsUrl={midtransSnapJsUrl()}
                  clientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""}
                />
              ) : (
                <form action={markInvoicePaid}>
                  <input type="hidden" name="invoiceId" value={pendingInvoice.id} />
                  <Button type="submit" variant="primary">
                    Simulasikan Pembayaran Berhasil
                  </Button>
                </form>
              )}
              <form action={cancelInvoice}>
                <input type="hidden" name="invoiceId" value={pendingInvoice.id} />
                <Button type="submit" variant="ghost">
                  Batalkan
                </Button>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* BAB 18.4 — Perbandingan Paket */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-forest-700">Pilih Paket</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const p = PLANS[key];
            const isCurrent = key === subscription.plan;
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col rounded-lg border bg-white p-6 shadow-soft",
                  isCurrent ? "border-forest-500 ring-1 ring-forest-500" : "border-champagne-100",
                )}
              >
                <p className="font-heading text-xl font-semibold text-forest-700">{p.label}</p>
                <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
                <p className="mt-4 font-heading text-2xl font-semibold text-forest-700">
                  {formatRupiah(p.price)}
                  {p.price > 0 && <span className="text-sm font-normal text-slate-500">/bulan</span>}
                </p>

                <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                  <li>• {p.maxEvents === 999 ? "Acara aktif tanpa batas" : `${p.maxEvents} acara aktif`}</li>
                  {PLAN_FEATURES.map((row) => (
                    <li key={row.label}>
                      • {row.label}:{" "}
                      {typeof row.values[key] === "boolean" ? (
                        row.values[key] ? "✅" : "❌"
                      ) : (
                        row.values[key]
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="ghost" className="w-full" disabled>
                      Paket Saat Ini
                    </Button>
                  ) : (
                    <form action={requestUpgrade}>
                      <input type="hidden" name="plan" value={key} />
                      <Button type="submit" variant="primary" className="w-full" disabled={!!pendingInvoice}>
                        {PLAN_ORDER.indexOf(key) > PLAN_ORDER.indexOf(subscription.plan)
                          ? "Upgrade"
                          : "Downgrade"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BAB 18.12 — Riwayat Transaksi */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-forest-700">Riwayat Transaksi</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-champagne-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">No. Invoice</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Belum ada transaksi.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-champagne-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    INV-{inv.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{PLANS[inv.plan].label}</td>
                  <td className="px-4 py-3">{formatRupiah(inv.amount)}</td>
                  <td className="px-4 py-3">{inv.paymentMethod ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        statusStyles[inv.status],
                      )}
                    >
                      {statusLabel[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDateID(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Unduh invoice PDF akan tersedia setelah integrasi payment gateway aktif (BAB 18.8).
        </p>
      </section>
    </div>
  );
}

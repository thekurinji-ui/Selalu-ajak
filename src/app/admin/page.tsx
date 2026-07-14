import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import {
  Users,
  CalendarHeart,
  Send,
  CheckSquare,
  QrCode,
  Wallet,
  CreditCard,
  Sparkles,
} from "lucide-react";

// BAB 21.3 — Dashboard Admin: ringkasan platform secara real-time.
export default async function AdminDashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    totalEvents,
    activeEventsToday,
    publishedEvents,
    totalRsvp,
    totalCheckins,
    activeSubscriptions,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.count({ where: { date: { gte: today, lt: tomorrow } } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.rsvp.count(),
    prisma.checkIn.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: { not: "BASIC" } } }),
    prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);

  const cards = [
    { label: "Total Pengguna", value: totalUsers.toLocaleString("id-ID"), icon: Users },
    { label: "Total Acara", value: totalEvents.toLocaleString("id-ID"), icon: CalendarHeart },
    { label: "Acara Aktif Hari Ini", value: activeEventsToday.toLocaleString("id-ID"), icon: Sparkles },
    { label: "Undangan Dipublikasikan", value: publishedEvents.toLocaleString("id-ID"), icon: Send },
    { label: "Total RSVP", value: totalRsvp.toLocaleString("id-ID"), icon: CheckSquare },
    { label: "Total QR Check-in", value: totalCheckins.toLocaleString("id-ID"), icon: QrCode },
    { label: "Langganan Berbayar Aktif", value: activeSubscriptions.toLocaleString("id-ID"), icon: CreditCard },
    { label: "Pendapatan (Total)", value: formatRupiah(revenueAgg._sum.amount ?? 0), icon: Wallet },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-white">Dashboard Admin</h1>
      <p className="mt-1 text-sm text-slate-400">Ringkasan platform Selalu Ajak secara keseluruhan.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-slate-800 bg-slate-950 p-5">
            <Icon size={20} className="text-amber-400" />
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

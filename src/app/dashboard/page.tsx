import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

// BAB 8.4 — Dashboard Overview
export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const events = userId
    ? await prisma.event.findMany({
        where: { userId },
        include: { guests: { include: { rsvp: true, checkIn: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const totalGuests = events.reduce((sum, e) => sum + e.guests.length, 0);
  const totalRsvp = events.reduce(
    (sum, e) => sum + e.guests.filter((g) => g.rsvp?.status === "AKAN_HADIR").length,
    0,
  );
  const totalCheckin = events.reduce(
    (sum, e) => sum + e.guests.filter((g) => g.checkIn).length,
    0,
  );

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-forest-700">
            {greeting}, {session?.user?.name ?? "Sahabat Selalu Ajak"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Berikut ringkasan acara Anda.</p>
        </div>
        <Link href="/dashboard/events">
          <Button>+ Buat Acara</Button>
        </Link>
      </div>

      {/* BAB 8.4 — Statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Acara" value={events.length} />
        <StatCard label="Total Tamu" value={totalGuests} />
        <StatCard label="RSVP Akan Hadir" value={totalRsvp} />
        <StatCard label="Sudah Check-in" value={totalCheckin} />
      </div>

      {/* BAB 8.18 — Empty State */}
      {events.length === 0 && (
        <div className="mt-12 rounded-lg border border-dashed border-champagne-300 bg-white p-12 text-center">
          <h2 className="font-heading text-xl font-semibold text-forest-700">Belum Ada Acara</h2>
          <p className="mt-2 text-sm text-slate-500">
            Mari mulai perjalanan pertama Anda dengan membuat acara baru.
          </p>
          <Link href="/dashboard/events">
            <Button className="mt-6">+ Buat Acara</Button>
          </Link>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-lg font-semibold text-forest-700">Acara Anda</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="rounded-lg border border-champagne-100 bg-white p-5 shadow-soft transition hover:shadow-medium"
              >
                <p className="font-heading text-base font-medium text-forest-700">{event.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-champagne-600">{event.status}</p>
                <p className="mt-2 text-sm text-slate-500">{event.guests.length} tamu diundang</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold text-forest-700">{value}</p>
    </div>
  );
}

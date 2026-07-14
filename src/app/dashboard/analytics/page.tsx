import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// BAB 15 — Analytics & Reporting
export default async function AnalyticsPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const [guestCount, rsvpYes, checkinCount, pageViews, giftClicks] = activeEventId
    ? await Promise.all([
        prisma.guest.count({ where: { eventId: activeEventId } }),
        prisma.rsvp.count({ where: { guest: { eventId: activeEventId }, status: "AKAN_HADIR" } }),
        prisma.checkIn.count({ where: { guest: { eventId: activeEventId } } }),
        prisma.analyticsEvent.count({ where: { eventId: activeEventId, type: "page_view" } }),
        prisma.analyticsEvent.count({ where: { eventId: activeEventId, type: "gift_click" } }),
      ])
    : [0, 0, 0, 0, 0];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Analytics &amp; Reporting</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Tamu" value={guestCount} />
        <Stat label="RSVP Hadir" value={rsvpYes} />
        <Stat label="Sudah Check-in" value={checkinCount} />
        <Stat label="Pengunjung Website" value={pageViews} />
        <Stat label="Klik Digital Gift" value={giftClicks} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold text-forest-700">{value}</p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// BAB 12 — RSVP Management
export default async function RsvpPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const rsvps = activeEventId
    ? await prisma.rsvp.findMany({
        where: { guest: { eventId: activeEventId } },
        include: { guest: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const summary = {
    akanHadir: rsvps.filter((r) => r.status === "AKAN_HADIR").length,
    tidakHadir: rsvps.filter((r) => r.status === "TIDAK_HADIR").length,
    belumMerespons: rsvps.filter((r) => r.status === "BELUM_MERESPONS").length,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">RSVP Management</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Akan Hadir" value={summary.akanHadir} />
        <Stat label="Tidak Hadir" value={summary.tidakHadir} />
        <Stat label="Belum Merespons" value={summary.belumMerespons} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-champagne-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nama Tamu</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Pendamping</th>
              <th className="px-4 py-3">Ucapan</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id} className="border-t border-champagne-50">
                <td className="px-4 py-3 font-medium text-slate-800">{r.guest.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.status}</td>
                <td className="px-4 py-3 text-slate-600">{r.companions}</td>
                <td className="px-4 py-3 text-slate-500">{r.wishMessage ?? "-"}</td>
              </tr>
            ))}
            {rsvps.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Belum ada RSVP masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-4 shadow-soft">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-forest-700">{value}</p>
    </div>
  );
}

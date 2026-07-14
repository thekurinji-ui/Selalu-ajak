import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

// BAB 14 — QR Check-in (BAB 14.8 — Manual Check-in sebagai fallback awal;
// pemindaian kamera akan ditambahkan pada iterasi berikutnya)
async function manualCheckin(formData: FormData) {
  "use server";
  const guestId = formData.get("guestId") as string;
  if (!guestId) return;

  await prisma.checkIn.upsert({
    where: { guestId },
    create: { guestId, method: "MANUAL" },
    update: {},
  });
}

export default async function CheckinPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const guests = activeEventId
    ? await prisma.guest.findMany({
        where: { eventId: activeEventId },
        include: { checkIn: true, rsvp: true },
        orderBy: { name: "asc" },
      })
    : [];

  const checkedIn = guests.filter((g) => g.checkIn).length;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">QR Check-in</h1>
      <p className="mt-1 text-sm text-slate-500">
        {checkedIn} dari {guests.length} tamu sudah check-in.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-champagne-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id} className="border-t border-champagne-50">
                <td className="px-4 py-3 font-medium text-slate-800">{guest.name}</td>
                <td className="px-4 py-3 text-slate-600">{guest.rsvp?.status ?? "-"}</td>
                <td className="px-4 py-3">
                  {guest.checkIn ? (
                    <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Sudah Check-in
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      Belum Hadir
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!guest.checkIn && (
                    <form action={manualCheckin}>
                      <input type="hidden" name="guestId" value={guest.id} />
                      <Button type="submit" variant="ghost">
                        Check-in
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guestSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 11.4 — Menambahkan Tamu (Tambah Manual)
async function addGuest(formData: FormData) {
  "use server";

  const eventId = formData.get("eventId") as string;
  const parsed = guestSchema.safeParse({
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") || "",
    category: formData.get("category") || undefined,
    companions: formData.get("companions") || 0,
  });

  if (!parsed.success || !eventId) return;

  await prisma.guest.create({
    data: {
      eventId,
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email || null,
      category: parsed.data.category,
      companions: parsed.data.companions,
    },
  });
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const guests = activeEventId
    ? await prisma.guest.findMany({
        where: { eventId: activeEventId },
        include: { rsvp: true, checkIn: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Guest Management</h1>

      {!activeEventId ? (
        <p className="mt-4 text-sm text-slate-500">
          Buat acara terlebih dahulu di halaman Events untuk mengelola tamu.
        </p>
      ) : (
        <>
          {/* BAB 11.13 — Dashboard Ringkas */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MiniStat label="Total Tamu" value={guests.length} />
            <MiniStat label="RSVP Hadir" value={guests.filter((g) => g.rsvp?.status === "AKAN_HADIR").length} />
            <MiniStat label="Sudah Check-in" value={guests.filter((g) => g.checkIn).length} />
          </div>

          <form
            action={addGuest}
            className="mt-6 grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft sm:grid-cols-2"
          >
            <input type="hidden" name="eventId" value={activeEventId} />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama Tamu</label>
              <Input name="name" required placeholder="Bapak Andi" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
              <Input name="whatsapp" required placeholder="0812xxxxxxxx" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
              <Input name="category" placeholder="Keluarga / Sahabat / VIP" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Jumlah Pendamping</label>
              <Input name="companions" type="number" min={0} defaultValue={0} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">+ Tambah Tamu</Button>
            </div>
          </form>

          <div className="mt-6 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-champagne-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">RSVP</th>
                  <th className="px-4 py-3">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-t border-champagne-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{guest.name}</td>
                    <td className="px-4 py-3 text-slate-600">{guest.whatsapp}</td>
                    <td className="px-4 py-3 text-slate-600">{guest.category ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge status={guest.rsvp?.status ?? "BELUM_MERESPONS"} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{guest.checkIn ? "Sudah Check-in" : "-"}</td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Belum ada tamu. Tambahkan tamu pertama Anda di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-4 shadow-soft">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-forest-700">{value}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    BELUM_MERESPONS: "bg-slate-100 text-slate-600",
    AKAN_HADIR: "bg-success/10 text-success",
    TIDAK_HADIR: "bg-danger/10 text-danger",
  };
  const label: Record<string, string> = {
    BELUM_MERESPONS: "Belum Merespons",
    AKAN_HADIR: "Akan Hadir",
    TIDAK_HADIR: "Tidak Hadir",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

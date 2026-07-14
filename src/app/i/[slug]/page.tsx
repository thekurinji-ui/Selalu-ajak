import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateID } from "@/lib/utils";
import { rsvpSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 17 — Event Website: halaman undangan publik yang diakses tamu.
// Mendukung personalisasi via ?to=Nama%20Tamu (BAB 10.11 / BAB 11.14).
export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { to?: string };
}) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { invitationPage: true, digitalGift: true },
  });

  if (!event || event.status !== "PUBLISHED") notFound();

  const guestName = searchParams.to ? decodeURIComponent(searchParams.to) : undefined;

  async function submitRsvp(formData: FormData) {
    "use server";

    const eventId = event!.id;
    const parsed = rsvpSchema.safeParse({
      status: formData.get("status"),
      companions: formData.get("companions") || 0,
      wishMessage: formData.get("wishMessage") || undefined,
    });
    if (!parsed.success) return;

    const name = (formData.get("name") as string) ?? "Tamu";
    const whatsapp = (formData.get("whatsapp") as string) ?? "-";

    const guest = await prisma.guest.create({
      data: { eventId, name, whatsapp },
    });

    await prisma.rsvp.create({
      data: {
        guestId: guest.id,
        status: parsed.data.status,
        companions: parsed.data.companions,
        wishMessage: parsed.data.wishMessage,
        answeredAt: new Date(),
      },
    });

    await prisma.analyticsEvent.create({
      data: { eventId, type: "rsvp_submit" },
    });
  }

  return (
    <main className="min-h-screen bg-ivory">
      {/* Opening Cover — BAB 17.4 */}
      <section
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{
          backgroundImage: event.coverImageUrl ? `url(${event.coverImageUrl})` : undefined,
        }}
      >
        <p className="font-heading text-sm uppercase tracking-widest text-champagne-600">
          {guestName ? `Kepada Yth. ${guestName}` : "Undangan"}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-forest-700 md:text-6xl">
          {event.name}
        </h1>
        {event.date && (
          <p className="mt-4 text-lg text-slate-600">{formatDateID(event.date)}</p>
        )}
      </section>

      {/* Event Information — BAB 17.5 */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold text-forest-700">Informasi Acara</h2>
        <div className="mt-6 space-y-2 text-slate-600">
          {event.date && <p>{formatDateID(event.date)}</p>}
          {event.location && <p>{event.location}</p>}
          {event.address && <p>{event.address}</p>}
        </div>
        {event.description && (
          <p className="mt-8 whitespace-pre-line text-slate-700">{event.description}</p>
        )}
      </section>

      {/* RSVP — BAB 12.4 */}
      {event.invitationPage?.rsvpEnabled && (
        <section className="mx-auto max-w-md px-6 py-16">
          <h2 className="text-center font-heading text-2xl font-semibold text-forest-700">
            Konfirmasi Kehadiran
          </h2>
          <form action={submitRsvp} className="mt-6 space-y-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nama</label>
              <Input name="name" required defaultValue={guestName} placeholder="Nama Anda" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
              <Input name="whatsapp" required placeholder="0812xxxxxxxx" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Kehadiran</label>
              <select name="status" required className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm">
                <option value="AKAN_HADIR">Akan Hadir</option>
                <option value="TIDAK_HADIR">Tidak Hadir</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Jumlah Pendamping</label>
              <Input name="companions" type="number" min={0} defaultValue={0} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ucapan &amp; Doa</label>
              <textarea
                name="wishMessage"
                rows={3}
                className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
                placeholder="Selamat menempuh hidup baru..."
              />
            </div>
            <Button type="submit" className="w-full">
              Kirim Konfirmasi
            </Button>
          </form>
        </section>
      )}

      {/* Digital Gift — BAB 16 */}
      {event.digitalGift?.enabled && (
        <section className="mx-auto max-w-md px-6 py-16 text-center">
          <h2 className="font-heading text-2xl font-semibold text-forest-700">Tanda Kasih</h2>
          {event.digitalGift.message && (
            <p className="mt-4 text-sm text-slate-600">{event.digitalGift.message}</p>
          )}
        </section>
      )}

      <footer className="border-t border-champagne-100 py-10 text-center text-sm text-slate-400">
        Dipersembahkan melalui Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.
      </footer>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueEventSlug } from "@/lib/slug";
import { eventSchema } from "@/lib/validation";
import { getEventUsage } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// BAB 9.4 — Alur Pembuatan Acara (langkah 1: informasi dasar → simpan draft)
async function createEvent(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // BAB 18.4 — jumlah acara dibatasi sesuai paket langganan aktif.
  const { limitReached } = await getEventUsage(session.user.id);
  if (limitReached) redirect("/dashboard/events?error=limit");

  const parsed = eventSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    date: formData.get("date") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) return;

  const slug = await generateUniqueEventSlug(parsed.data.name);

  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      date: parsed.data.date,
      city: parsed.data.city,
      slug,
      invitationPage: { create: { sections: [] } },
    },
  });

  redirect(`/dashboard/events/${event.id}`);
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();
  const events = session?.user?.id
    ? await prisma.event.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Acara Saya</h1>

      {searchParams.error === "limit" && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Batas jumlah acara pada paket kamu sudah tercapai.{" "}
          <Link href="/dashboard/billing" className="font-medium underline">
            Upgrade paket
          </Link>{" "}
          untuk membuat acara lebih banyak.
        </div>
      )}

      <form
        action={createEvent}
        className="mt-6 grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Acara</label>
          <Input name="name" required placeholder="Pernikahan Puti & Aldo" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Jenis Acara</label>
          <select
            name="type"
            required
            className="w-full rounded-md border border-champagne-200 bg-white px-3 py-2 text-sm"
          >
            <option value="PERNIKAHAN">Pernikahan</option>
            <option value="LAMARAN">Lamaran</option>
            <option value="ULANG_TAHUN">Ulang Tahun</option>
            <option value="WISUDA">Wisuda</option>
            <option value="CORPORATE_EVENT">Corporate Event</option>
            <option value="KOMUNITAS">Komunitas</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal</label>
          <Input name="date" type="date" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Kota</label>
          <Input name="city" placeholder="Jakarta" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">+ Buat Acara</Button>
        </div>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/dashboard/events/${event.id}`}
            className="rounded-lg border border-champagne-100 bg-white p-5 shadow-soft transition hover:shadow-medium"
          >
            <p className="font-heading text-base font-medium text-forest-700">{event.name}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-champagne-600">{event.status}</p>
            <p className="mt-2 text-sm text-slate-400">selaluajak.kurinji.asia/i/{event.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

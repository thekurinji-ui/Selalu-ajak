import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueEventSlug } from "@/lib/slug";
import { eventSchema } from "@/lib/validation";
import { getEventUsage } from "@/lib/subscription";
import { THEME_PRESETS } from "@/lib/invitation-themes";
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
    templateId: formData.get("templateId") || undefined,
  });

  if (!parsed.success) return;

  const slug = await generateUniqueEventSlug(parsed.data.name);

  // Template Marketplace — kalau user memilih template, pakai
  // `defaultSections` & `primaryColor` template itu sebagai titik awal
  // Invitation Builder, bukan kanvas kosong. Template DRAFT/ARCHIVED tetap
  // divalidasi ulang di server (bukan cuma percaya <select> di client).
  const template = parsed.data.templateId
    ? await prisma.invitationTemplate.findFirst({
        where: { id: parsed.data.templateId, status: "PUBLISHED" },
      })
    : null;

  // Template sekarang membawa tema lengkap (bukan cuma primaryColor) — begitu
  // user pilih template, warna + font ikut ke-set otomatis dari
  // THEME_PRESETS, jadi user nggak perlu buka ThemeDrawer lagi kecuali mau
  // kustomisasi lebih lanjut (opsional, di Invitation Builder).
  const preset = template
    ? THEME_PRESETS.find((p) => p.id === template.defaultThemeId) ?? THEME_PRESETS[0]
    : null;

  const event = await prisma.event.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      date: parsed.data.date,
      city: parsed.data.city,
      slug,
      templateId: template?.id,
      ...(preset
        ? {
            theme: preset.id,
            primaryColor: preset.colors.primary,
            secondaryColor: preset.colors.secondary,
            backgroundColor: preset.colors.background,
            fontId: preset.fontId,
          }
        : {}),
      invitationPage: {
        create: { sections: template?.defaultSections ?? [] },
      },
    },
  });

  if (template) {
    await prisma.invitationTemplate.update({
      where: { id: template.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  redirect(`/dashboard/events/${event.id}`);
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await auth();
  const [events, templates] = session?.user?.id
    ? await Promise.all([
        prisma.event.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.invitationTemplate.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        }),
      ])
    : [[], []];

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

        {templates.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Pilih Gaya Undangan (opsional)
            </label>
            <p className="mb-2 text-xs text-slate-400">
              Struktur dan tema (warna & font) sudah sepaket — tinggal pilih satu, bisa
              disesuaikan lagi nanti di editor kalau mau.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-champagne-200 has-[:checked]:border-forest-600 has-[:checked]:ring-2 has-[:checked]:ring-forest-600">
                <input type="radio" name="templateId" value="" defaultChecked className="sr-only" />
                <div className="flex aspect-[3/4] items-center justify-center bg-champagne-50 text-xs text-slate-400">
                  Kanvas Kosong
                </div>
                <span className="px-2 py-2 text-xs font-medium text-slate-600">Mulai dari kosong</span>
              </label>
              {templates.map((t) => {
                const preset = THEME_PRESETS.find((p) => p.id === t.defaultThemeId) ?? THEME_PRESETS[0];
                return (
                  <label
                    key={t.id}
                    className="flex cursor-pointer flex-col overflow-hidden rounded-md border border-champagne-200 has-[:checked]:border-forest-600 has-[:checked]:ring-2 has-[:checked]:ring-forest-600"
                  >
                    <input type="radio" name="templateId" value={t.id} className="sr-only" />
                    <img
                      src={t.thumbnailUrl}
                      alt={t.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <span className="flex items-center justify-between gap-1 px-2 py-2 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: preset.colors.primary }}
                          aria-hidden
                        />
                        {t.name}
                      </span>
                      {t.isPremium && (
                        <span className="rounded bg-champagne-100 px-1.5 py-0.5 text-[10px] font-semibold text-champagne-700">
                          Premium
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

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

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rsvpSchema } from "@/lib/validation";
import { parseSections } from "@/lib/invitation-sections";
import { SectionRenderer } from "@/components/invitation/SectionRenderer";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";

// BAB 17 — Event Website: halaman undangan publik yang diakses tamu.
// Mendukung personalisasi via ?to=Nama%20Tamu (BAB 10.11 / BAB 11.14).
// Konten section-based dibaca dari InvitationPage.sections (BAB 10.3/10.4),
// hasil susunan pengguna di Invitation Builder — bukan lagi hardcoded.
export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { to?: string; g?: string };
}) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { invitationPage: true, digitalGift: true },
  });

  if (!event || event.status !== "PUBLISHED") notFound();

  // `g` = Guest.qrCode, dikirim lewat link undangan pribadi tamu (WhatsApp
  // Blast otomatis maupun Kirim Manual via WA Pribadi). Kalau ketemu, ini
  // sumber personalisasi & tiket QR yang bisa dipercaya (bukan sekadar teks
  // bebas dari URL kayak `?to=`), karena qrCode-nya unik per tamu.
  const guest = searchParams.g
    ? await prisma.guest.findFirst({ where: { qrCode: searchParams.g, eventId: event.id } })
    : null;

  const guestName = guest?.name ?? (searchParams.to ? decodeURIComponent(searchParams.to) : undefined);

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

  const sections = parseSections(event.invitationPage?.sections).filter((s) => {
    if (s.type === "rsvp") return event.invitationPage?.rsvpEnabled ?? true;
    if (s.type === "wishes") return event.invitationPage?.wishesEnabled ?? true;
    if (s.type === "digital_gift") return event.digitalGift?.enabled ?? false;
    return true;
  });

  const eventContext = {
    name: event.name,
    date: event.date,
    location: event.location,
    address: event.address,
    description: event.description,
    coverImageUrl: event.coverImageUrl,
    digitalGift: event.digitalGift
      ? {
          enabled: event.digitalGift.enabled,
          message: event.digitalGift.message,
          qrisImageUrl: event.digitalGift.qrisImageUrl,
          bankAccounts: Array.isArray(event.digitalGift.bankAccounts)
            ? (event.digitalGift.bankAccounts as any[])
            : [],
          eWallets: Array.isArray(event.digitalGift.eWallets) ? (event.digitalGift.eWallets as any[]) : [],
        }
      : null,
  };

  return (
    <main className="min-h-screen">
      <ThemeProvider
        theme={{
          theme: event.theme,
          primaryColor: event.primaryColor,
          secondaryColor: event.secondaryColor,
          backgroundColor: event.backgroundColor,
          fontId: event.fontId,
        }}
      >
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            event={eventContext}
            guestName={guestName}
            mode="live"
            onSubmitRsvp={submitRsvp}
          />
        ))}

        {/* BAB 14.2 — Tiket QR Check-in pribadi tamu. Cuma tampil kalau link
            undangan yang dibuka membawa `?g=` (qrCode tamu) yang valid —
            supaya QR tiap orang cuma kelihatan lewat link pribadinya sendiri. */}
        {guest && (
          <section className="mx-auto max-w-md px-6 py-16 text-center">
            <h2 className="font-heading text-2xl font-semibold text-forest-700">Tiket Masuk Anda</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tunjukkan QR ini ke petugas saat check-in di lokasi acara.
            </p>
            <div className="mx-auto mt-6 inline-block rounded-lg border border-champagne-200 bg-white p-4 shadow-soft">
              <img
                src={`/api/public/qrcode/${guest.qrCode}`}
                alt={`QR Check-in untuk ${guest.name}`}
                width={240}
                height={240}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-forest-700">{guest.name}</p>
          </section>
        )}
      </ThemeProvider>
    </main>
  );
}

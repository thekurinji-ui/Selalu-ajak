import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { rsvpSchema } from "@/lib/validation";
import { parseSections } from "@/lib/invitation-sections";
import { SectionRenderer } from "@/components/invitation/SectionRenderer";

// BAB 17 — Event Website: halaman undangan publik yang diakses tamu.
// Mendukung personalisasi via ?to=Nama%20Tamu (BAB 10.11 / BAB 11.14).
// Konten section-based dibaca dari InvitationPage.sections (BAB 10.3/10.4),
// hasil susunan pengguna di Invitation Builder — bukan lagi hardcoded.
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
    <main className="min-h-screen bg-ivory">
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
    </main>
  );
}

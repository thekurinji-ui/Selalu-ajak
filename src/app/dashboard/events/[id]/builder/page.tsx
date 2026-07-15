import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSections } from "@/lib/invitation-sections";
import { InvitationBuilder } from "@/components/builder/InvitationBuilder";

// BAB 10 — Invitation Builder: editor visual drag-and-drop di atas kolom
// InvitationPage.sections (Json). Diakses dari workspace acara (BAB 9.8).
export default async function InvitationBuilderPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const event = await prisma.event.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { invitationPage: true, digitalGift: true },
  });

  if (!event) notFound();

  const sections = parseSections(event.invitationPage?.sections);

  return (
    <InvitationBuilder
      eventId={event.id}
      eventSlug={event.slug}
      initialSections={sections}
      initialTheme={{
        theme: event.theme,
        primaryColor: event.primaryColor,
        secondaryColor: event.secondaryColor,
        backgroundColor: event.backgroundColor,
        fontId: event.fontId,
      }}
      event={{
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
      }}
    />
  );
}

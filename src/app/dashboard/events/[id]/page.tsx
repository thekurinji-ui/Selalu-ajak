import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// BAB 9.8 — Workspace Acara
async function publishEvent(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  await prisma.event.update({ where: { id: eventId }, data: { status: "PUBLISHED" } });
}

export default async function EventWorkspacePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const event = await prisma.event.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { guests: true },
  });

  if (!event) notFound();

  const invitationUrl = `/i/${event.slug}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-forest-700">{event.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Status: <span className="font-medium text-champagne-600">{event.status}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={invitationUrl} target="_blank">
            <Button variant="ghost">Preview</Button>
          </Link>
          {event.status !== "PUBLISHED" && (
            <form action={publishEvent}>
              <input type="hidden" name="eventId" value={event.id} />
              <Button type="submit">Publish</Button>
            </form>
          )}
        </div>
      </div>

      {/* BAB 9.8 — Menu Workspace */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WorkspaceCard href={`/dashboard/guests?eventId=${event.id}`} title="Guests" desc={`${event.guests.length} tamu`} />
        <WorkspaceCard href={`/dashboard/rsvp?eventId=${event.id}`} title="RSVP" desc="Lihat konfirmasi kehadiran" />
        <WorkspaceCard href={`/dashboard/whatsapp?eventId=${event.id}`} title="WhatsApp Blast" desc="Kirim undangan massal" />
        <WorkspaceCard href={`/dashboard/checkin?eventId=${event.id}`} title="QR Check-in" desc="Registrasi tamu hari-H" />
        <WorkspaceCard href={`/dashboard/gift?eventId=${event.id}`} title="Digital Gift" desc="Atur metode hadiah digital" />
        <WorkspaceCard href={`/dashboard/analytics?eventId=${event.id}`} title="Analytics" desc="Statistik performa acara" />
      </div>
    </div>
  );
}

function WorkspaceCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-champagne-100 bg-white p-5 shadow-soft transition hover:shadow-medium"
    >
      <p className="font-heading text-base font-medium text-forest-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}

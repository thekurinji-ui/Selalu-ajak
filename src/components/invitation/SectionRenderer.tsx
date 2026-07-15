"use client";

import { useEffect, useState } from "react";
import { formatDateID } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SectionInstance } from "@/lib/invitation-sections";

export interface InvitationEventContext {
  name: string;
  date?: Date | string | null;
  location?: string | null;
  address?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  digitalGift?: {
    enabled: boolean;
    message?: string | null;
    bankAccounts?: { bank: string; number: string; holder?: string }[] | null;
    eWallets?: { provider: string; number: string }[] | null;
    qrisImageUrl?: string | null;
  } | null;
}

interface SectionRendererProps {
  section: SectionInstance;
  event: InvitationEventContext;
  guestName?: string;
  /** "live" = halaman publik tamu, "preview" = kanvas di dalam Invitation Builder */
  mode?: "live" | "preview";
  onSubmitRsvp?: (formData: FormData) => void;
}

// BAB 10.5 — Komponen Section. Setiap `case` di sini merepresentasikan satu
// section dari BAB 10.4 (Struktur Invitation).
export function SectionRenderer({ section, event, guestName, mode = "live", onSubmitRsvp }: SectionRendererProps) {
  if (!section.visible) return null;

  switch (section.type) {
    case "cover":
      return <CoverSection section={section} event={event} guestName={guestName} />;
    case "opening_message":
      return <OpeningMessageSection section={section} />;
    case "couple":
      return <CoupleSection section={section} />;
    case "event_info":
      return <EventInfoSection section={section} event={event} />;
    case "countdown":
      return <CountdownSection event={event} />;
    case "story":
      return <StorySection section={section} />;
    case "timeline":
      return <TimelineSection section={section} />;
    case "gallery":
      return <GallerySection section={section} />;
    case "video":
      return <VideoSection section={section} />;
    case "maps":
      return <MapsSection section={section} event={event} />;
    case "rsvp":
      return <RsvpSection guestName={guestName} mode={mode} onSubmitRsvp={onSubmitRsvp} />;
    case "digital_gift":
      return <DigitalGiftSection event={event} />;
    case "wishes":
      return <WishesSection />;
    case "footer":
      return <FooterSection section={section} />;
    default:
      return null;
  }
}

function SectionShell({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section className={className} style={style}>
      {children}
    </section>
  );
}

function CoverSection({
  section,
  event,
  guestName,
}: {
  section: SectionInstance;
  event: InvitationEventContext;
  guestName?: string;
}) {
  const photo = section.data.photoUrl || event.coverImageUrl;
  return (
    <SectionShell
      className="flex min-h-screen flex-col items-center justify-center bg-forest-50/40 bg-cover bg-center px-6 text-center"
      style={{ backgroundImage: photo ? `url(${photo})` : undefined }}
    >
      <p className="font-heading text-sm uppercase tracking-widest text-champagne-600">
        {guestName ? `Kepada Yth. ${guestName}` : "Undangan"}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-semibold text-forest-700 md:text-6xl">
        {section.data.eventTitle || event.name}
      </h1>
      {section.data.hostName && <p className="mt-2 text-lg text-slate-600">{section.data.hostName}</p>}
      {event.date && <p className="mt-4 text-lg text-slate-600">{formatDateID(event.date)}</p>}
      <button className="mt-8 rounded-md bg-forest-600 px-6 py-2 text-sm font-medium text-white shadow-soft">
        {section.data.openButtonLabel || "Buka Undangan"}
      </button>
    </SectionShell>
  );
}

function OpeningMessageSection({ section }: { section: SectionInstance }) {
  if (!section.data.message && !section.data.quote) return null;
  return (
    <SectionShell className="mx-auto max-w-xl px-6 py-16 text-center">
      {section.data.quote && (
        <p className="font-heading text-xl italic text-forest-700">&ldquo;{section.data.quote}&rdquo;</p>
      )}
      {section.data.message && <p className="mt-6 whitespace-pre-line text-slate-600">{section.data.message}</p>}
    </SectionShell>
  );
}

function CoupleSection({ section }: { section: SectionInstance }) {
  const members: any[] = section.data.members || [];
  return (
    <SectionShell className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Mempelai</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {members.map((m, i) => (
          <div key={i}>
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-champagne-50">
              {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />}
            </div>
            <p className="mt-4 font-heading text-lg font-medium text-forest-700">{m.name || "Nama"}</p>
            {m.parents && <p className="text-sm text-slate-500">{m.parents}</p>}
            {m.description && <p className="mt-2 text-sm text-slate-600">{m.description}</p>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function EventInfoSection({ section, event }: { section: SectionInstance; event: InvitationEventContext }) {
  return (
    <SectionShell className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Informasi Acara</h2>
      <div className="mt-6 space-y-2 text-slate-600">
        {event.date && <p>{formatDateID(event.date)}</p>}
        {event.location && <p>{event.location}</p>}
        {event.address && <p>{event.address}</p>}
        {section.data.dressCode && <p>Dress Code: {section.data.dressCode}</p>}
      </div>
      {event.description && <p className="mt-8 whitespace-pre-line text-slate-700">{event.description}</p>}
    </SectionShell>
  );
}

function CountdownSection({ event }: { event: InvitationEventContext }) {
  const [remaining, setRemaining] = useState<null | { d: number; h: number; m: number; s: number }>(null);

  useEffect(() => {
    if (!event.date) return;
    const target = new Date(event.date).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event.date]);

  if (!event.date) return null;

  return (
    <SectionShell className="mx-auto max-w-md px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Menuju Hari Bahagia</h2>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          { label: "Hari", value: remaining?.d ?? 0 },
          { label: "Jam", value: remaining?.h ?? 0 },
          { label: "Menit", value: remaining?.m ?? 0 },
          { label: "Detik", value: remaining?.s ?? 0 },
        ].map((u) => (
          <div key={u.label} className="rounded-md border border-champagne-100 bg-white py-3 shadow-soft">
            <p className="font-heading text-xl font-semibold text-forest-700">{u.value}</p>
            <p className="text-xs text-slate-500">{u.label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function StorySection({ section }: { section: SectionInstance }) {
  return (
    <SectionShell className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">{section.data.title || "Kisah Kami"}</h2>
      {section.data.body ? (
        <p className="mt-6 whitespace-pre-line text-slate-600">{section.data.body}</p>
      ) : (
        <p className="mt-6 text-sm italic text-slate-400">Ceritakan perjalanan kalian di sini.</p>
      )}
    </SectionShell>
  );
}

function TimelineSection({ section }: { section: SectionInstance }) {
  const items: any[] = section.data.items || [];
  return (
    <SectionShell className="mx-auto max-w-xl px-6 py-16">
      <h2 className="text-center font-heading text-2xl font-semibold text-forest-700">Rangkaian Acara</h2>
      <div className="mt-8 space-y-6 border-l-2 border-champagne-200 pl-6">
        {items.map((it, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-champagne-600">{it.time || "00.00"}</p>
            <p className="font-heading text-lg text-forest-700">{it.title || "Kegiatan"}</p>
            {it.description && <p className="text-sm text-slate-600">{it.description}</p>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function GallerySection({ section }: { section: SectionInstance }) {
  const images: string[] = section.data.images || [];
  const layout = section.data.layout || "grid";
  return (
    <SectionShell className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Galeri</h2>
      {images.length === 0 ? (
        <p className="mt-6 text-sm italic text-slate-400">Belum ada foto ditambahkan.</p>
      ) : (
        <div
          className={
            layout === "carousel"
              ? "mt-8 flex snap-x gap-3 overflow-x-auto"
              : "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={
                layout === "carousel"
                  ? "h-56 w-40 shrink-0 snap-center rounded-md object-cover"
                  : "aspect-square w-full rounded-md object-cover"
              }
            />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function VideoSection({ section }: { section: SectionInstance }) {
  if (!section.data.videoUrl) return null;
  return (
    <SectionShell className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Video</h2>
      <div className="mt-6 aspect-video overflow-hidden rounded-md shadow-soft">
        <iframe src={section.data.videoUrl} className="h-full w-full" allowFullScreen title="Video" />
      </div>
    </SectionShell>
  );
}

function MapsSection({ section, event }: { section: SectionInstance; event: InvitationEventContext }) {
  return (
    <SectionShell className="mx-auto max-w-xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Lokasi</h2>
      <p className="mt-4 text-slate-600">{section.data.venueName || event.location}</p>
      {event.address && <p className="text-sm text-slate-500">{event.address}</p>}
      {section.data.mapsUrl && (
        <a
          href={section.data.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-md bg-forest-600 px-5 py-2 text-sm font-medium text-white shadow-soft"
        >
          Buka Peta
        </a>
      )}
    </SectionShell>
  );
}

function RsvpSection({
  guestName,
  mode,
  onSubmitRsvp,
}: {
  guestName?: string;
  mode: "live" | "preview";
  onSubmitRsvp?: (formData: FormData) => void;
}) {
  return (
    <SectionShell className="mx-auto max-w-md px-6 py-16">
      <h2 className="text-center font-heading text-2xl font-semibold text-forest-700">Konfirmasi Kehadiran</h2>
      <form
        action={mode === "live" ? onSubmitRsvp : undefined}
        onSubmit={mode === "preview" ? (e) => e.preventDefault() : undefined}
        className="mt-6 space-y-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft"
      >
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
    </SectionShell>
  );
}

function DigitalGiftSection({ event }: { event: InvitationEventContext }) {
  const gift = event.digitalGift;
  const banks = gift?.bankAccounts || [];
  const wallets = gift?.eWallets || [];
  const hasMethod = banks.length > 0 || wallets.length > 0 || !!gift?.qrisImageUrl;

  return (
    <SectionShell className="mx-auto max-w-md px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Tanda Kasih</h2>
      <p className="mt-4 text-sm text-slate-600">
        {gift?.message || "Kehadiran dan doa restu Anda sudah menjadi hadiah yang sangat berarti bagi kami."}
      </p>

      {gift?.qrisImageUrl && (
        <div className="mt-6">
          <img src={gift.qrisImageUrl} alt="QRIS" className="mx-auto h-48 w-48 rounded-md object-contain shadow-soft" />
          <p className="mt-2 text-xs text-slate-500">Pindai kode QRIS di atas</p>
        </div>
      )}

      {banks.length > 0 && (
        <div className="mt-6 space-y-3 text-left">
          {banks.map((b, i) => (
            <div key={i} className="rounded-md border border-champagne-100 bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-forest-700">{b.bank}</p>
              <p className="mt-1 font-mono text-sm text-slate-700">{b.number}</p>
              {b.holder && <p className="text-xs text-slate-500">a.n. {b.holder}</p>}
            </div>
          ))}
        </div>
      )}

      {wallets.length > 0 && (
        <div className="mt-4 space-y-3 text-left">
          {wallets.map((w, i) => (
            <div key={i} className="rounded-md border border-champagne-100 bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-forest-700">{w.provider}</p>
              <p className="mt-1 font-mono text-sm text-slate-700">{w.number}</p>
            </div>
          ))}
        </div>
      )}

      {!hasMethod && (
        <p className="mt-4 text-xs italic text-slate-400">
          Metode hadiah digital belum diatur — lengkapi di menu Digital Gift pada workspace acara.
        </p>
      )}
    </SectionShell>
  );
}

function WishesSection() {
  return (
    <SectionShell className="mx-auto max-w-md px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-forest-700">Ucapan &amp; Doa</h2>
      <p className="mt-4 text-sm text-slate-400">Ucapan dari tamu akan tampil di sini setelah undangan dipublikasikan.</p>
    </SectionShell>
  );
}

function FooterSection({ section }: { section: SectionInstance }) {
  return (
    <SectionShell className="border-t border-champagne-100 py-10 text-center text-sm text-slate-400">
      <p>{section.data.closingMessage || "Terima kasih atas doa dan restu Anda."}</p>
      <p className="mt-1">Dipersembahkan melalui Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.</p>
    </SectionShell>
  );
}

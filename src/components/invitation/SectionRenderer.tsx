"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { formatDateID } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SectionInstance } from "@/lib/invitation-sections";
import { CinematicInviteSection } from "./CinematicInviteSection";
import { resolveMotionConfig } from "@/lib/motion-config";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollCamera } from "@/components/motion/ScrollCamera";
import { KenBurnsImage } from "@/components/motion/KenBurnsImage";
import { MultiLayerParallax, type ParallaxLayer } from "@/components/motion/MultiLayerParallax";

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
    case "cinematic_intro":
      return <CinematicInviteSection section={section} event={event} guestName={guestName} />;
    case "cover":
      return <CoverSection section={section} event={event} guestName={guestName} />;
    case "opening_message":
      return <OpeningMessageSection section={section} />;
    case "couple":
      return <CoupleSection section={section} />;
    case "event_info":
      return <EventInfoSection section={section} event={event} />;
    case "event_detail":
      return <EventDetailSection section={section} />;
    case "countdown":
      return <CountdownSection section={section} event={event} />;
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
  const layers: ParallaxLayer[] = section.data.layers || [];
  // Legacy: field `scrollEffect: "parallax"` dari revisi sebelum motion engine
  // ini ada → dipetakan otomatis ke config baru biar template lama tetap jalan.
  const motionConfig = resolveMotionConfig(section.data, { camera: "zoom-in", parallax: "vertical" });
  const useKenBurns = motionConfig?.imageEffect === "ken-burns";

  return (
    <SectionShell className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-theme-bg px-6 text-center">
      {layers.length > 0 ? (
        <MultiLayerParallax layers={layers} intensity={motionConfig?.intensity} className="absolute inset-0 -z-10" />
      ) : (
        photo &&
        (useKenBurns ? (
          <KenBurnsImage src={photo} config={motionConfig} className="absolute inset-0 -z-10" />
        ) : (
          <ScrollCamera config={motionConfig} className="absolute inset-0 -z-10">
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
          </ScrollCamera>
        ))
      )}
      <p className="font-heading text-sm uppercase tracking-widest text-theme-secondary">
        {guestName ? `Kepada Yth. ${guestName}` : "Undangan"}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-semibold text-theme-primary md:text-6xl">
        {section.data.eventTitle || event.name}
      </h1>
      {section.data.hostName && <p className="mt-2 text-lg text-theme-muted">{section.data.hostName}</p>}
      {event.date && <p className="mt-4 text-lg text-theme-muted">{formatDateID(event.date)}</p>}
      <button className="mt-8 rounded-md bg-theme-primary px-6 py-2 text-sm font-medium text-white shadow-soft">
        {section.data.openButtonLabel || "Buka Undangan"}
      </button>
    </SectionShell>
  );
}

function OpeningMessageSection({ section }: { section: SectionInstance }) {
  if (!section.data.message && !section.data.quote) return null;
  const motionConfig = resolveMotionConfig(section.data);
  const photo = section.data.photoUrl;

  return (
    <SectionShell className="relative mx-auto max-w-xl overflow-hidden px-6 py-24 text-center">
      {photo && (
        <ScrollCamera config={{ camera: "zoom-in", intensity: "subtle", ...motionConfig }} className="absolute inset-0 -z-10 opacity-20">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
        </ScrollCamera>
      )}
      <Reveal config={motionConfig ?? { reveal: "fade" }}>
        {section.data.quote && (
          <p className="font-heading text-xl italic text-theme-primary">&ldquo;{section.data.quote}&rdquo;</p>
        )}
        {section.data.source && <p className="mt-3 text-sm uppercase tracking-widest text-theme-secondary">{section.data.source}</p>}
        {section.data.message && <p className="mt-6 whitespace-pre-line text-theme-muted">{section.data.message}</p>}
      </Reveal>
    </SectionShell>
  );
}

// Gaya foto & layout couple section bisa beda per template lewat data.photoShape
// & data.layout — kalau tidak diisi, fallback ke "circle" + "side-by-side" (klasik).
const COUPLE_PHOTO_SHAPE_CLASS: Record<string, string> = {
  circle: "aspect-square rounded-full",
  rounded: "aspect-[3/4] rounded-2xl",
  square: "aspect-square rounded-md",
};

function CoupleSection({ section }: { section: SectionInstance }) {
  const members: any[] = section.data.members || [];
  const photoShape = COUPLE_PHOTO_SHAPE_CLASS[section.data.photoShape as string] ?? COUPLE_PHOTO_SHAPE_CLASS.circle;
  const isStacked = section.data.layout === "stacked";
  // Bulet klasik dibuat kecil (h-28 w-28); rounded/square dibuat besar & full width.
  const sizeClass = section.data.photoShape && section.data.photoShape !== "circle" ? "w-full max-w-sm" : "h-28 w-28";

  return (
    <SectionShell className={`mx-auto px-6 py-16 text-center ${isStacked ? "max-w-xl" : "max-w-3xl"}`}>
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Mempelai</h2>
      <div className={isStacked ? "mt-8 flex flex-col gap-14" : "mt-8 grid gap-8 sm:grid-cols-2"}>
        {members.map((m, i) => (
          <Reveal key={i} config={m.motion ?? { reveal: i % 2 === 0 ? "slide-left" : "slide-right" }}>
            <div className={`mx-auto overflow-hidden bg-theme-bg shadow-soft ${photoShape} ${sizeClass}`}>
              {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />}
            </div>
            <p className="mt-5 font-heading text-xl font-medium text-theme-primary">{m.name || "Nama"}</p>
            {m.parents && <p className="text-sm text-theme-muted">{m.parents}</p>}
            {m.description && <p className="mt-2 text-sm text-theme-muted">{m.description}</p>}
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function EventInfoSection({ section, event }: { section: SectionInstance; event: InvitationEventContext }) {
  return (
    <SectionShell className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Informasi Acara</h2>
      <div className="mt-6 space-y-2 text-theme-muted">
        {event.date && <p>{formatDateID(event.date)}</p>}
        {event.location && <p>{event.location}</p>}
        {event.address && <p>{event.address}</p>}
        {section.data.dressCode && <p>Dress Code: {section.data.dressCode}</p>}
      </div>
      {event.description && <p className="mt-8 whitespace-pre-line text-theme-text">{event.description}</p>}
    </SectionShell>
  );
}

// Kartu detail satu sesi acara (mis. Akad Nikah / Resepsi) dengan background
// foto sendiri + parallax/curtain — dipakai berkali-kali kalau acara punya
// lebih dari satu rangkaian, beda dari `event_info` yang singleton & generik.
function EventDetailSection({ section }: { section: SectionInstance }) {
  const d = section.data;
  const photo = d.photoUrl;
  const layers: ParallaxLayer[] = d.layers || [];
  const hasBackground = layers.length > 0 || !!photo;
  const motionConfig = resolveMotionConfig(d, { parallax: "vertical" });
  const useKenBurns = motionConfig?.imageEffect === "ken-burns";

  return (
    <SectionShell className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {layers.length > 0 ? (
        <>
          <MultiLayerParallax layers={layers} intensity={motionConfig?.intensity} className="absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-black/45" />
        </>
      ) : (
        photo &&
        (useKenBurns ? (
          <>
            <KenBurnsImage src={photo} config={motionConfig} className="absolute inset-0 -z-20" />
            <div className="absolute inset-0 -z-10 bg-black/45" />
          </>
        ) : (
          <>
            <ScrollCamera config={motionConfig} className="absolute inset-0 -z-20">
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
            </ScrollCamera>
            <div className="absolute inset-0 -z-10 bg-black/45" />
          </>
        ))
      )}
      <Reveal config={{ reveal: "curtain", ...(!hasBackground ? motionConfig : {}) }}>
        <h2 className={`font-heading text-3xl font-semibold ${hasBackground ? "text-white" : "text-theme-primary"}`}>
          {d.title || "Acara"}
        </h2>
        <p className={`mt-4 text-lg ${hasBackground ? "text-white/90" : "text-theme-muted"}`}>
          {[d.day, d.date].filter(Boolean).join(", ")}
        </p>
        {(d.time || d.timeNote) && (
          <p className={`mt-1 text-sm ${hasBackground ? "text-white/80" : "text-theme-muted"}`}>
            {[d.time, d.timeNote].filter(Boolean).join(" ")}
          </p>
        )}
        {d.locationName && (
          <p className={`mt-6 font-heading text-lg ${hasBackground ? "text-white" : "text-theme-primary"}`}>{d.locationName}</p>
        )}
        {d.address && <p className={`mt-1 text-sm ${hasBackground ? "text-white/80" : "text-theme-muted"}`}>{d.address}</p>}
        {d.mapsUrl && (
          <a
            href={d.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block rounded-md bg-theme-primary px-6 py-2 text-sm font-medium text-white shadow-soft"
          >
            {d.buttonLabel || "Lihat Lokasi"}
          </a>
        )}
      </Reveal>
    </SectionShell>
  );
}

function CountdownSection({ section, event }: { section: SectionInstance; event: InvitationEventContext }) {
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

  const motionConfig = resolveMotionConfig(section.data);
  const background = section.data.background;
  const onDark = !!background;

  return (
    <SectionShell
      className="mx-auto max-w-md px-6 py-16 text-center"
      style={background ? { background } : undefined}
    >
      <Reveal config={motionConfig ?? { reveal: "fade" }}>
        <h2 className={`font-heading text-2xl font-semibold ${onDark ? "text-white" : "text-theme-primary"}`}>
          {section.data.title || "Menuju Hari Bahagia"}
        </h2>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { label: "Hari", value: remaining?.d ?? 0 },
            { label: "Jam", value: remaining?.h ?? 0 },
            { label: "Menit", value: remaining?.m ?? 0 },
            { label: "Detik", value: remaining?.s ?? 0 },
          ].map((u) => (
            <div
              key={u.label}
              className={
                onDark
                  ? "rounded-md border border-white/25 bg-white/10 py-3"
                  : "rounded-md border border-theme-border bg-theme-surface py-3 shadow-soft"
              }
            >
              <p className={`font-heading text-xl font-semibold ${onDark ? "text-white" : "text-theme-primary"}`}>{u.value}</p>
              <p className={`text-xs ${onDark ? "text-white/75" : "text-theme-muted"}`}>{u.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  );
}

function StorySection({ section }: { section: SectionInstance }) {
  return (
    <SectionShell className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">{section.data.title || "Kisah Kami"}</h2>
      {section.data.body ? (
        <p className="mt-6 whitespace-pre-line text-theme-muted">{section.data.body}</p>
      ) : (
        <p className="mt-6 text-sm italic text-theme-muted">Ceritakan perjalanan kalian di sini.</p>
      )}
    </SectionShell>
  );
}

function TimelineSection({ section }: { section: SectionInstance }) {
  const items: any[] = section.data.items || [];
  return (
    <SectionShell className="mx-auto max-w-xl px-6 py-16">
      <h2 className="text-center font-heading text-2xl font-semibold text-theme-primary">
        {section.data.title || "Rangkaian Acara"}
      </h2>
      <div className="mt-8 space-y-6 border-l-2 border-theme-border pl-6">
        {items.map((it, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-theme-secondary">{it.time || "00.00"}</p>
            <p className="font-heading text-lg text-theme-primary">{it.title || "Kegiatan"}</p>
            {it.description && <p className="text-sm text-theme-muted">{it.description}</p>}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function GallerySection({ section }: { section: SectionInstance }) {
  const images: string[] = section.data.images || [];
  const layout = section.data.layout || "grid";
  // Legacy: efek gallery lama ("scrollEffect: parallax") sebenarnya reveal
  // zoom-in per foto, bukan continuous scroll — dipetakan ke reveal:"scale".
  const motionConfig = resolveMotionConfig(section.data, { reveal: "scale" });

  const imgClassName =
    layout === "carousel"
      ? "h-56 w-40 shrink-0 snap-center rounded-md object-cover"
      : layout === "poster-row"
        ? "aspect-[3/4] w-full rounded-md object-cover"
        : "aspect-square w-full rounded-md object-cover";

  return (
    <SectionShell className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Galeri</h2>
      {images.length === 0 ? (
        <p className="mt-6 text-sm italic text-theme-muted">Belum ada foto ditambahkan.</p>
      ) : (
        <div
          className={
            layout === "carousel" || layout === "poster-row"
              ? "mt-8 flex snap-x gap-3 overflow-x-auto"
              : "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
          }
        >
          {images.map((src, i) => (
            <Reveal key={i} config={motionConfig ? { ...motionConfig, delay: (i % 6) * 0.05 } : undefined}>
              <img src={src} alt="" className={imgClassName} />
            </Reveal>
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
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Video</h2>
      <div className="mt-6 aspect-video overflow-hidden rounded-md shadow-soft">
        <iframe src={section.data.videoUrl} className="h-full w-full" allowFullScreen title="Video" />
      </div>
    </SectionShell>
  );
}

function MapsSection({ section, event }: { section: SectionInstance; event: InvitationEventContext }) {
  return (
    <SectionShell className="mx-auto max-w-xl px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Lokasi</h2>
      <p className="mt-4 text-theme-muted">{section.data.venueName || event.location}</p>
      {event.address && <p className="text-sm text-theme-muted">{event.address}</p>}
      {section.data.mapsUrl && (
        <a
          href={section.data.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-md bg-theme-primary px-5 py-2 text-sm font-medium text-white shadow-soft"
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
      <h2 className="text-center font-heading text-2xl font-semibold text-theme-primary">Konfirmasi Kehadiran</h2>
      <form
        action={mode === "live" ? onSubmitRsvp : undefined}
        onSubmit={mode === "preview" ? (e) => e.preventDefault() : undefined}
        className="mt-6 space-y-4 rounded-lg border border-theme-border bg-theme-surface p-6 shadow-soft"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-theme-text">Nama</label>
          <Input
            name="name"
            required
            defaultValue={guestName}
            placeholder="Nama Anda"
            className="border-theme-border bg-theme-surface text-theme-text placeholder:text-theme-muted focus:border-theme-primary focus:ring-theme-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-theme-text">Nomor WhatsApp</label>
          <Input
            name="whatsapp"
            required
            placeholder="0812xxxxxxxx"
            className="border-theme-border bg-theme-surface text-theme-text placeholder:text-theme-muted focus:border-theme-primary focus:ring-theme-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-theme-text">Kehadiran</label>
          <select name="status" required className="w-full rounded-md border border-theme-border px-3 py-2 text-sm">
            <option value="AKAN_HADIR">Akan Hadir</option>
            <option value="TIDAK_HADIR">Tidak Hadir</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-theme-text">Jumlah Pendamping</label>
          <Input
            name="companions"
            type="number"
            min={0}
            defaultValue={0}
            className="border-theme-border bg-theme-surface text-theme-text focus:border-theme-primary focus:ring-theme-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-theme-text">Ucapan &amp; Doa</label>
          <textarea
            name="wishMessage"
            rows={3}
            className="w-full rounded-md border border-theme-border px-3 py-2 text-sm focus:border-theme-primary focus:outline-none"
            placeholder="Selamat menempuh hidup baru..."
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-theme-primary hover:bg-theme-primary-dark"
        >
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
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Tanda Kasih</h2>
      <p className="mt-4 text-sm text-theme-muted">
        {gift?.message || "Kehadiran dan doa restu Anda sudah menjadi hadiah yang sangat berarti bagi kami."}
      </p>

      {gift?.qrisImageUrl && (
        <div className="mt-6">
          <img src={gift.qrisImageUrl} alt="QRIS" className="mx-auto h-48 w-48 rounded-md object-contain shadow-soft" />
          <p className="mt-2 text-xs text-theme-muted">Pindai kode QRIS di atas</p>
        </div>
      )}

      {banks.length > 0 && (
        <div className="mt-6 space-y-3 text-left">
          {banks.map((b, i) => (
            <div key={i} className="rounded-md border border-theme-border bg-theme-surface p-4 shadow-soft">
              <p className="text-sm font-semibold text-theme-primary">{b.bank}</p>
              <p className="mt-1 font-mono text-sm text-theme-text">{b.number}</p>
              {b.holder && <p className="text-xs text-theme-muted">a.n. {b.holder}</p>}
            </div>
          ))}
        </div>
      )}

      {wallets.length > 0 && (
        <div className="mt-4 space-y-3 text-left">
          {wallets.map((w, i) => (
            <div key={i} className="rounded-md border border-theme-border bg-theme-surface p-4 shadow-soft">
              <p className="text-sm font-semibold text-theme-primary">{w.provider}</p>
              <p className="mt-1 font-mono text-sm text-theme-text">{w.number}</p>
            </div>
          ))}
        </div>
      )}

      {!hasMethod && (
        <p className="mt-4 text-xs italic text-theme-muted">
          Metode hadiah digital belum diatur — lengkapi di menu Digital Gift pada workspace acara.
        </p>
      )}
    </SectionShell>
  );
}

function WishesSection() {
  return (
    <SectionShell className="mx-auto max-w-md px-6 py-16 text-center">
      <h2 className="font-heading text-2xl font-semibold text-theme-primary">Ucapan &amp; Doa</h2>
      <p className="mt-4 text-sm text-theme-muted">Ucapan dari tamu akan tampil di sini setelah undangan dipublikasikan.</p>
    </SectionShell>
  );
}

function FooterSection({ section }: { section: SectionInstance }) {
  const photo = section.data.photoUrl;
  const motionConfig = resolveMotionConfig(section.data);
  const useKenBurns = motionConfig?.imageEffect === "ken-burns";

  if (!photo) {
    return (
      <SectionShell className="border-t border-theme-border py-10 text-center text-sm text-theme-muted">
        <p>{section.data.closingMessage || "Terima kasih atas doa dan restu Anda."}</p>
        <p className="mt-1">Dipersembahkan melalui Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.</p>
      </SectionShell>
    );
  }

  return (
    <SectionShell className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {useKenBurns ? (
        <KenBurnsImage src={photo} config={motionConfig} className="absolute inset-0 -z-20" />
      ) : (
        <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />
      )}
      <div className="absolute inset-0 -z-10 bg-black/50" />
      <Reveal config={motionConfig ?? { reveal: "fade" }}>
        <p className="whitespace-pre-line text-white/90">{section.data.closingMessage || "Terima kasih atas doa dan restu Anda."}</p>
        <p className="mt-3 text-sm text-white/70">Dipersembahkan melalui Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.</p>
      </Reveal>
    </SectionShell>
  );
}

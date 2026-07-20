"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
// ---------------------------------------------------------------------------
// InfiniteZoomInvitation — REVISI "Satu Kanvas Rumah Gadang"
//
// Beda dari versi sebelumnya (frame-per-frame fade & scale di tempat), revisi
// ini pakai SATU scene besar berisi aset `luxury-parallax-minang`
// (sky, cloud, gunung-kerinci, pohon, rumah-gadang-hero) yang dikomposisi
// jadi satu "mural" raksasa. Kamera (scroll) lalu berpindah dari satu titik
// ke titik lain DI DALAM mural yang sama — bukan berpindah gambar:
//
//   1. cover        → mural penuh terlihat (zoom out)
//   2. couple-photo  → kamera masuk ke tengah rumah gadang, foto mempelai
//   3. opening       → geser ke area langit/awan, kartu pesan pembuka
//   4. event-info    → geser ke pohon, kartu detail acara (akad & resepsi)
//   5. papan-bunga   → geser ke depan rumah gadang, papan bunga foto galeri
//   6. cover-out     → kamera zoom out lagi, balik persis ke framing cover
//
// Setelah waypoint terakhir (zoom-out), area sticky-scroll ini selesai dan
// halaman lanjut scroll NORMAL (bukan scroll-jacking lagi) menuju section-
// section standar undangan: sapaan tamu, kisah cinta, profil mempelai,
// detail acara lengkap, countdown, lokasi, galeri penuh, RSVP, digital gift,
// ucapan, dan footer penutup.
//
// STATUS: masih standalone (lihat catatan jujur di file lama) — belum
// disambung ke SectionRenderer/template system/`/i/[slug]`. Cek halaman tes
// di src/app/dev/infinite-zoom/page.tsx.
//
// CATATAN JUJUR soal kalibrasi kamera:
// Titik (cx, cy) & level zoom di CAMERA_WAYPOINTS dikalibrasi secara visual
// untuk layar HP (~420px). Di layar lebar/desktop efeknya akan terasa
// "lebih jauh" — sama seperti keterbatasan yang sudah dicatat di prototipe
// ZoomCanvas. Kalau nanti dites di device asli dan framing-nya kurang pas
// (misal papan bunga kepotong, atau kartu pesan pembuka nabrak awan), cukup
// geser angka cx/cy/zoom di CAMERA_WAYPOINTS — tidak perlu ubah struktur.
//
// CATATAN JUJUR soal RSVP / Digital Gift / Wishes:
// Sama seperti prototipe sebelumnya, tiga section ini di sini masih bentuk
// visual + form standalone (belum tersambung ke API submit asli). Sengaja
// dibiarkan begitu supaya file ini tetap bisa dites terisolasi. Kalau sudah
// oke, sambungkan ke handler asli via prop `onSubmitRsvp`, atau ganti total
// dengan <SectionRenderer /> begitu di-wire ke sistem template.
// ---------------------------------------------------------------------------

const ASSET = "/templates/luxury-parallax-minang";

// Satuan kanvas bebas ("cu"), BUKAN pixel layar. Portrait, mendekati rasio
// poster cover lama (9:14) supaya framing "cover" tetap familiar.
const CANVAS = { width: 1000, height: 1600 };

interface CameraWaypoint {
  id: string;
  cx: number;
  cy: number;
  zoom: number;
}

const CAMERA_WAYPOINTS: CameraWaypoint[] = [
  { id: "cover", cx: 500, cy: 800, zoom: 0.46 },
  { id: "couple-photo", cx: 500, cy: 550, zoom: 1.55 },
  { id: "opening", cx: 705, cy: 235, zoom: 1.55 },
  { id: "event-info", cx: 825, cy: 1390, zoom: 1.55 },
  { id: "papan-bunga", cx: 500, cy: 1290, zoom: 1.6 },
  { id: "cover-out", cx: 500, cy: 800, zoom: 0.46 },
];

// ---------------------------------------------------------------------------
// Tipe data
// ---------------------------------------------------------------------------

export interface InfiniteZoomPersonProfile {
  photoUrl: string;
  name: string;
  parents: string;
}

export interface InfiniteZoomEventDetail {
  id: string;
  label: string; // "Akad Nikah"
  dateLabel?: string; // "Sabtu, 12 Desember 2026"
  timeLabel: string; // "08.00 - 10.00 WIB"
  venueName?: string;
  address?: string;
  mapsUrl?: string;
}

export interface InfiniteZoomLoveStoryChapter {
  year?: string;
  title: string;
  body: string;
}

export interface InfiniteZoomGiftAccount {
  bank: string;
  number: string;
  holder?: string;
}

export interface InfiniteZoomInvitationProps {
  /** Nama tamu — otomatis tampil di sapaan setelah kamera zoom-out. */
  guestName?: string;
  /** "Ayu & Bagas" — dipakai di cover & footer. */
  coupleNames: string;
  coverEyebrow?: string;
  /** "Sabtu, 12 Desember 2026 — Grand Ballroom, Jakarta" */
  coverDateLabel?: string;
  /** Foto mempelai yang muncul di tengah rumah gadang (waypoint ke-2). */
  couplePhotoUrl: string;

  openingMessage: { eyebrow?: string; body: string };

  bride: InfiniteZoomPersonProfile;
  groom: InfiniteZoomPersonProfile;

  /** Minimal 1 — dipakai di kartu waypoint pohon (ringkas) & section detail acara (lengkap). */
  events: InfiniteZoomEventDetail[];
  /** Target countdown. Kalau kosong, section countdown otomatis disembunyikan. */
  countdownTarget?: string | Date;

  loveStory?: InfiniteZoomLoveStoryChapter[];

  /** Foto yang tampil di "papan bunga" depan rumah gadang (waypoint ke-5). */
  highlightPhotoUrl?: string;
  gallery?: string[];

  location: { venueName: string; address?: string; mapsUrl?: string };

  digitalGift?: { message?: string; accounts?: InfiniteZoomGiftAccount[]; qrisImageUrl?: string };

  footer: { coupleNames: string; dateLabel?: string; message?: string };

  onSubmitRsvp?: (formData: FormData) => void;
}

// ---------------------------------------------------------------------------
// Komponen utama
// ---------------------------------------------------------------------------

export function InfiniteZoomInvitation(props: InfiniteZoomInvitationProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <StaticFallback {...props} />;
  }

  return <ZoomExperience {...props} />;
}

function ZoomExperience(props: InfiniteZoomInvitationProps) {
  const { guestName, onSubmitRsvp } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const n = CAMERA_WAYPOINTS.length;
  const breakpoints = CAMERA_WAYPOINTS.map((_, i) => i / (n - 1));
  const cxMV = useTransform(scrollYProgress, breakpoints, CAMERA_WAYPOINTS.map((w) => w.cx));
  const cyMV = useTransform(scrollYProgress, breakpoints, CAMERA_WAYPOINTS.map((w) => w.cy));
  const zoomMV = useTransform(scrollYProgress, breakpoints, CAMERA_WAYPOINTS.map((w) => w.zoom));

  // Titik (cx, cy) harus selalu jatuh di tengah layar (50vw, 50vh) berapa pun
  // level zoom-nya — translasinya ikut dikalikan zoom juga (sama seperti
  // kalibrasi di prototipe ZoomCanvas).
  const translateX = useTransform([cxMV, zoomMV], (v) => {
    const [cx, zoom] = v as number[];
    return `calc(50vw - ${cx * zoom}px)`;
  });
  const translateY = useTransform([cyMV, zoomMV], (v) => {
    const [cy, zoom] = v as number[];
    return `calc(50vh - ${cy * zoom}px)`;
  });

  return (
    <div className="relative bg-theme-bg">
      {/* --- Bagian 1: kanvas rumah gadang, scroll-jacked, n waypoint --- */}
      <div ref={containerRef} className="relative" style={{ height: `${n * 90}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#EFE7D2]">
          <motion.div
            className="absolute left-0 top-0"
            style={{
              width: CANVAS.width,
              height: CANVAS.height,
              x: translateX,
              y: translateY,
              scale: zoomMV,
              transformOrigin: "0 0",
            }}
          >
            <MinangMuralScene {...props} />
          </motion.div>

          <ScrollProgressHint progress={scrollYProgress} />
        </div>
      </div>

      {/* --- Bagian 2: divider Minang, penanda transisi ke scroll normal --- */}
      <SongketDivider />

      {/* --- Bagian 3: section standar, scroll normal (bukan scroll-jacking) --- */}
      <GreetingSection guestName={guestName} />
      {props.loveStory && props.loveStory.length > 0 ? <LoveStorySection chapters={props.loveStory} /> : null}
      <CoupleProfilesSection bride={props.bride} groom={props.groom} />
      <EventDetailSection events={props.events} />
      {props.countdownTarget ? <CountdownSection target={props.countdownTarget} coupleNames={props.coupleNames} /> : null}
      <LocationSection location={props.location} />
      {props.gallery && props.gallery.length > 0 ? <GallerySection photos={props.gallery} /> : null}
      <RsvpSection guestName={guestName} onSubmitRsvp={onSubmitRsvp} />
      {props.digitalGift ? <DigitalGiftSection gift={props.digitalGift} /> : null}
      <WishesSection />
      <SongketDivider flipped />
      <FooterSection footer={props.footer} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mural rumah gadang — SATU scene berisi semua layer + semua konten waypoint.
// Kamera (parent motion.div) yang bergerak; DOM di sini diam di tempat.
// ---------------------------------------------------------------------------

function MinangMuralScene({
  guestName,
  coupleNames,
  coverEyebrow = "The Wedding of",
  coverDateLabel,
  couplePhotoUrl,
  openingMessage,
  events,
  highlightPhotoUrl,
}: InfiniteZoomInvitationProps) {
  const firstTwoEvents = events.slice(0, 2);
  const flowerPhoto = highlightPhotoUrl || couplePhotoUrl;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* --- Layer latar: langit → awan → gunung → pohon → rumah gadang --- */}
      {/* eslint-disable @next/next/no-img-element */}
      <img src={`${ASSET}/sky.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <img src={`${ASSET}/cloud-01.webp`} alt="" className="absolute left-[-8%] top-[6%] w-[55%] opacity-80" />
      <img src={`${ASSET}/cloud-03.webp`} alt="" className="absolute right-[-6%] top-[14%] w-[45%] opacity-75" />
      <img src={`${ASSET}/cloud-02.webp`} alt="" className="absolute left-[4%] top-[26%] w-[30%] opacity-60" />
      <img src={`${ASSET}/gunung-kerinci.webp`} alt="" className="absolute bottom-[30%] left-0 w-full" />
      <img src={`${ASSET}/pohon-01.webp`} alt="" className="absolute bottom-0 left-[-2%] w-[22%]" />
      <img src={`${ASSET}/pohon-02.webp`} alt="" className="absolute bottom-0 right-[-2%] w-[24%]" />
      <img src={`${ASSET}/rumah-gadang-hero.webp`} alt="" className="absolute bottom-[6%] left-[7.5%] w-[85%]" />
      <img src={`${ASSET}/top-ornament.webp`} alt="" className="absolute top-0 left-0 w-full" />

      {/* --- Teks cover: eyebrow atas + judul & sapaan bawah --- */}
      <div className="absolute top-[10%] w-full text-center">
        <p className="font-theme-body text-[11px] uppercase tracking-[0.4em] text-[#EEDFBE]/90">{coverEyebrow}</p>
      </div>
      <div className="absolute bottom-[2%] w-full text-center">
        <h1 className="font-theme-heading text-2xl text-[#FFFDF8]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          {coupleNames}
        </h1>
        {coverDateLabel ? <p className="mt-1 font-theme-body text-xs text-[#EEDFBE]/85">{coverDateLabel}</p> : null}
        {guestName ? <p className="mt-1 font-theme-body text-xs text-[#EEDFBE]/70">Kepada Yth. {guestName}</p> : null}
      </div>

      {/* --- Waypoint 2: foto mempelai, framed bulat di tengah rumah gadang --- */}
      <Positioned cx={500} cy={550} width={460}>
        <div className="aspect-square w-full overflow-hidden rounded-full border-[6px] border-[#EEDFBE] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
          <img src={couplePhotoUrl} alt="" className="h-full w-full object-cover" />
        </div>
      </Positioned>

      {/* --- Waypoint 3: kartu pesan pembuka, melayang di area awan --- */}
      <Positioned cx={705} cy={235} width={420}>
        <div className="rounded-2xl bg-theme-surface/95 px-6 py-5 text-center shadow-floating backdrop-blur-sm">
          {openingMessage.eyebrow ? (
            <p className="mb-2 font-theme-body text-[11px] uppercase tracking-[0.3em] text-theme-muted">
              {openingMessage.eyebrow}
            </p>
          ) : null}
          <p className="font-theme-body text-sm leading-relaxed text-theme-text">{openingMessage.body}</p>
        </div>
      </Positioned>

      {/* --- Waypoint 4: kartu detail acara, di dekat pohon kanan --- */}
      <Positioned cx={825} cy={1390} width={380}>
        <div className="rounded-2xl bg-theme-surface/95 px-5 py-5 text-center shadow-floating backdrop-blur-sm">
          <p className="mb-2 font-theme-heading text-base text-theme-primary">Detail Acara</p>
          <div className="space-y-2">
            {firstTwoEvents.map((ev) => (
              <div key={ev.id}>
                <p className="font-theme-body text-xs uppercase tracking-[0.25em] text-theme-secondary">{ev.label}</p>
                <p className="font-theme-body text-sm text-theme-text">{ev.timeLabel}</p>
              </div>
            ))}
          </div>
        </div>
      </Positioned>

      {/* --- Waypoint 5: papan bunga, di depan rumah gadang --- */}
      <Positioned cx={500} cy={1290} width={360}>
        <div className="relative rounded-xl bg-[#3E2A1B] p-3 shadow-floating">
          <img src={`${ASSET}/flower-01.webp`} alt="" className="pointer-events-none absolute -left-6 -top-6 w-24" />
          <img src={`${ASSET}/flower-02.webp`} alt="" className="pointer-events-none absolute -right-6 -top-4 w-20" />
          <div className="overflow-hidden rounded-lg border-2 border-[#EEDFBE]">
            <img src={flowerPhoto} alt="" className="aspect-[4/3] w-full object-cover" />
          </div>
          <p className="mt-2 text-center font-theme-heading text-sm text-[#FFFDF8]">Selamat &amp; Sukses</p>
          <p className="text-center font-theme-body text-[10px] uppercase tracking-[0.25em] text-[#EEDFBE]/80">
            {coupleNames}
          </p>
        </div>
      </Positioned>
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}

/** Elemen konten yang dipatok di titik (cx, cy) kanvas, center-anchored. */
function Positioned({ cx, cy, width, children }: { cx: number; cy: number; width: number; children: ReactNode }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${(cx / CANVAS.width) * 100}%`,
        top: `${(cy / CANVAS.height) * 100}%`,
        width: `${(width / CANVAS.width) * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {children}
    </div>
  );
}

function ScrollProgressHint({ progress }: { progress: MotionValue<number> }) {
  const barHeight = useTransform(progress, [0, 1], ["4%", "100%"]);
  return (
    <div className="pointer-events-none absolute bottom-8 right-6 z-50 hidden h-24 w-[3px] overflow-hidden rounded-full bg-white/25 mix-blend-difference sm:block">
      <motion.div className="w-full rounded-full bg-white" style={{ height: barHeight }} />
    </div>
  );
}

function SongketDivider({ flipped = false }: { flipped?: boolean }) {
  return (
    <div className="relative h-10 w-full overflow-hidden bg-theme-bg sm:h-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${ASSET}/songket-divider-bottom.webp`}
        alt=""
        className="h-full w-full object-cover"
        style={flipped ? { transform: "scaleY(-1)" } : undefined}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section standar (scroll normal) — sapaan, kisah cinta, mempelai, acara,
// countdown, lokasi, galeri, RSVP, digital gift, ucapan, footer.
// ---------------------------------------------------------------------------

function SectionTexture({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-theme-bg ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ASSET}/songket-pattern.webp`} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.04]" />
      <div className="relative">{children}</div>
    </section>
  );
}

function GreetingSection({ guestName }: { guestName?: string }) {
  return (
    <SectionTexture className="px-6 py-16 text-center">
      <p className="font-theme-body text-[11px] uppercase tracking-[0.35em] text-theme-muted">Kepada Yth.</p>
      <h2 className="mt-2 font-theme-heading text-2xl text-theme-primary">
        {guestName?.trim() ? guestName : "Bapak/Ibu/Saudara/i"}
      </h2>
      <p className="mx-auto mt-3 max-w-sm font-theme-body text-sm text-theme-muted">
        Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir dan memberikan doa restu di hari bahagia kami.
      </p>
    </SectionTexture>
  );
}

function LoveStorySection({ chapters }: { chapters: InfiniteZoomLoveStoryChapter[] }) {
  return (
    <SectionTexture className="px-6 py-16">
      <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Kisah Kami</h2>
      <div className="mx-auto mt-8 max-w-xl space-y-8 border-l-2 border-theme-border pl-6">
        {chapters.map((c, i) => (
          <div key={i}>
            {c.year ? <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-secondary">{c.year}</p> : null}
            <p className="mt-1 font-theme-heading text-lg text-theme-primary">{c.title}</p>
            <p className="mt-1 font-theme-body text-sm text-theme-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </SectionTexture>
  );
}

function CoupleProfilesSection({ bride, groom }: { bride: InfiniteZoomPersonProfile; groom: InfiniteZoomPersonProfile }) {
  return (
    <SectionTexture className="px-6 py-16">
      <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Mempelai</h2>
      <div className="mx-auto mt-8 grid max-w-3xl gap-8 sm:grid-cols-2">
        {[bride, groom].map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-3 rounded-2xl bg-theme-surface p-6 text-center shadow-floating">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-theme-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photoUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <h3 className="font-theme-heading text-xl text-theme-primary">{p.name}</h3>
            <p className="font-theme-body text-sm text-theme-muted">{p.parents}</p>
          </div>
        ))}
      </div>
    </SectionTexture>
  );
}

function EventDetailSection({ events }: { events: InfiniteZoomEventDetail[] }) {
  return (
    <SectionTexture className="px-6 py-16">
      <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Rangkaian Acara</h2>
      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-2xl bg-theme-surface p-6 text-center shadow-floating">
            <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-secondary">{ev.label}</p>
            {ev.dateLabel ? <p className="mt-2 font-theme-heading text-lg text-theme-primary">{ev.dateLabel}</p> : null}
            <p className="mt-1 font-theme-body text-sm text-theme-text">{ev.timeLabel}</p>
            {ev.venueName ? <p className="mt-3 font-theme-body text-sm text-theme-muted">{ev.venueName}</p> : null}
            {ev.address ? <p className="font-theme-body text-xs text-theme-muted">{ev.address}</p> : null}
            {ev.mapsUrl ? (
              <a
                href={ev.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-md bg-theme-primary px-5 py-2 font-theme-body text-xs font-medium text-white shadow-soft"
              >
                Lihat Lokasi
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </SectionTexture>
  );
}

function CountdownSection({ target, coupleNames }: { target: string | Date; coupleNames: string }) {
  const [remaining, setRemaining] = useState<null | { d: number; h: number; m: number; s: number }>(null);

  useEffect(() => {
    const targetMs = new Date(target).getTime();
    const tick = () => {
      const diff = Math.max(0, targetMs - Date.now());
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
  }, [target]);

  return (
    <SectionTexture className="px-6 py-16 text-center">
      <h2 className="font-theme-heading text-2xl text-theme-primary">Menuju Hari Bahagia {coupleNames}</h2>
      <div className="mx-auto mt-6 grid max-w-md grid-cols-4 gap-3">
        {[
          { label: "Hari", value: remaining?.d ?? 0 },
          { label: "Jam", value: remaining?.h ?? 0 },
          { label: "Menit", value: remaining?.m ?? 0 },
          { label: "Detik", value: remaining?.s ?? 0 },
        ].map((u) => (
          <div key={u.label} className="rounded-xl border border-theme-border bg-theme-surface py-4 shadow-soft">
            <p className="font-theme-heading text-2xl text-theme-primary">{u.value}</p>
            <p className="font-theme-body text-[11px] uppercase tracking-[0.2em] text-theme-muted">{u.label}</p>
          </div>
        ))}
      </div>
    </SectionTexture>
  );
}

function LocationSection({ location }: { location: { venueName: string; address?: string; mapsUrl?: string } }) {
  return (
    <SectionTexture className="px-6 py-16 text-center">
      <h2 className="font-theme-heading text-2xl text-theme-primary">Lokasi</h2>
      <p className="mx-auto mt-4 max-w-sm font-theme-body text-theme-text">{location.venueName}</p>
      {location.address ? <p className="mx-auto mt-1 max-w-sm font-theme-body text-sm text-theme-muted">{location.address}</p> : null}
      {location.mapsUrl ? (
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-md bg-theme-primary px-6 py-2 font-theme-body text-sm font-medium text-white shadow-soft"
        >
          Buka Peta
        </a>
      ) : null}
    </SectionTexture>
  );
}

function GallerySection({ photos }: { photos: string[] }) {
  return (
    <SectionTexture className="px-6 py-16 text-center">
      <h2 className="font-theme-heading text-2xl text-theme-primary">Galeri</h2>
      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" className="aspect-square w-full rounded-lg object-cover shadow-soft" />
        ))}
      </div>
    </SectionTexture>
  );
}

function RsvpSection({
  guestName,
  onSubmitRsvp,
}: {
  guestName?: string;
  onSubmitRsvp?: (formData: FormData) => void;
}) {
  return (
    <SectionTexture className="px-6 py-16">
      <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Konfirmasi Kehadiran</h2>
      <form
        action={onSubmitRsvp}
        onSubmit={onSubmitRsvp ? undefined : (e) => e.preventDefault()}
        className="mx-auto mt-6 max-w-md space-y-4 rounded-2xl border border-theme-border bg-theme-surface p-6 shadow-floating"
      >
        <div>
          <label className="mb-1 block font-theme-body text-sm font-medium text-theme-text">Nama</label>
          <input
            name="name"
            required
            defaultValue={guestName}
            placeholder="Nama Anda"
            className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 font-theme-body text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>
        <div>
          <label className="mb-1 block font-theme-body text-sm font-medium text-theme-text">Nomor WhatsApp</label>
          <input
            name="whatsapp"
            required
            placeholder="0812xxxxxxxx"
            className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 font-theme-body text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-primary focus:outline-none focus:ring-1 focus:ring-theme-primary"
          />
        </div>
        <div>
          <label className="mb-1 block font-theme-body text-sm font-medium text-theme-text">Kehadiran</label>
          <select
            name="status"
            required
            className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 font-theme-body text-sm text-theme-text focus:border-theme-primary focus:outline-none"
          >
            <option value="AKAN_HADIR">Akan Hadir</option>
            <option value="TIDAK_HADIR">Tidak Hadir</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-theme-body text-sm font-medium text-theme-text">Jumlah Pendamping</label>
          <input
            name="companions"
            type="number"
            min={0}
            defaultValue={0}
            className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 font-theme-body text-sm text-theme-text focus:border-theme-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block font-theme-body text-sm font-medium text-theme-text">Ucapan &amp; Doa</label>
          <textarea
            name="wishMessage"
            rows={3}
            placeholder="Selamat menempuh hidup baru..."
            className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 font-theme-body text-sm text-theme-text placeholder:text-theme-muted focus:border-theme-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-theme-primary px-4 py-2 font-theme-body text-sm font-medium text-white shadow-soft hover:bg-theme-primary-dark"
        >
          Kirim Konfirmasi
        </button>
      </form>
    </SectionTexture>
  );
}

function DigitalGiftSection({ gift }: { gift: { message?: string; accounts?: InfiniteZoomGiftAccount[]; qrisImageUrl?: string } }) {
  const accounts = gift.accounts || [];
  return (
    <SectionTexture className="px-6 py-16 text-center">
      <h2 className="font-theme-heading text-2xl text-theme-primary">Tanda Kasih</h2>
      <p className="mx-auto mt-4 max-w-sm font-theme-body text-sm text-theme-muted">
        {gift.message || "Kehadiran dan doa restu Anda sudah menjadi hadiah yang sangat berarti bagi kami."}
      </p>
      {gift.qrisImageUrl ? (
        <div className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gift.qrisImageUrl} alt="QRIS" className="mx-auto h-48 w-48 rounded-md object-contain shadow-soft" />
        </div>
      ) : null}
      {accounts.length > 0 ? (
        <div className="mx-auto mt-6 max-w-sm space-y-3 text-left">
          {accounts.map((a, i) => (
            <div key={i} className="rounded-xl border border-theme-border bg-theme-surface p-4 shadow-soft">
              <p className="font-theme-body text-sm font-semibold text-theme-primary">{a.bank}</p>
              <p className="mt-1 font-mono text-sm text-theme-text">{a.number}</p>
              {a.holder ? <p className="font-theme-body text-xs text-theme-muted">a.n. {a.holder}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </SectionTexture>
  );
}

function WishesSection() {
  return (
    <SectionTexture className="px-6 py-16 text-center">
      <h2 className="font-theme-heading text-2xl text-theme-primary">Ucapan &amp; Doa</h2>
      <p className="mx-auto mt-4 max-w-sm font-theme-body text-sm text-theme-muted">
        Ucapan dari tamu akan tampil di sini setelah undangan dipublikasikan.
      </p>
    </SectionTexture>
  );
}

function FooterSection({ footer }: { footer: { coupleNames: string; dateLabel?: string; message?: string } }) {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-theme-bg px-6 py-24 text-center">
      <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-muted">Dengan penuh syukur</p>
      <h2 className="font-theme-heading text-4xl text-theme-primary sm:text-5xl">{footer.coupleNames}</h2>
      {footer.dateLabel ? <p className="font-theme-body text-theme-muted">{footer.dateLabel}</p> : null}
      {footer.message ? <p className="max-w-md font-theme-body text-theme-text">{footer.message}</p> : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Fallback non-animasi untuk `prefers-reduced-motion` — stack section biasa,
// cover ditampilkan sebagai satu gambar statis (bukan kanvas scroll-jacked).
// ---------------------------------------------------------------------------

function StaticFallback(props: InfiniteZoomInvitationProps) {
  const { guestName, coupleNames, coverEyebrow = "The Wedding of", coverDateLabel, couplePhotoUrl } = props;

  return (
    <div className="bg-theme-bg">
      <div className="relative aspect-[10/16] w-full max-w-sm mx-auto overflow-hidden">
        <MinangMuralScene {...props} />
      </div>
      <div className="px-6 py-8 text-center">
        <p className="font-theme-body text-[11px] uppercase tracking-[0.4em] text-theme-muted">{coverEyebrow}</p>
        <h1 className="mt-2 font-theme-heading text-2xl text-theme-primary">{coupleNames}</h1>
        {coverDateLabel ? <p className="mt-1 font-theme-body text-xs text-theme-muted">{coverDateLabel}</p> : null}
      </div>
      <div className="mx-auto aspect-square w-48 overflow-hidden rounded-full border-4 border-theme-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={couplePhotoUrl} alt="" className="h-full w-full object-cover" />
      </div>

      <SongketDivider />
      <GreetingSection guestName={guestName} />
      {props.loveStory && props.loveStory.length > 0 ? <LoveStorySection chapters={props.loveStory} /> : null}
      <CoupleProfilesSection bride={props.bride} groom={props.groom} />
      <EventDetailSection events={props.events} />
      {props.countdownTarget ? <CountdownSection target={props.countdownTarget} coupleNames={props.coupleNames} /> : null}
      <LocationSection location={props.location} />
      {props.gallery && props.gallery.length > 0 ? <GallerySection photos={props.gallery} /> : null}
      <RsvpSection guestName={guestName} onSubmitRsvp={props.onSubmitRsvp} />
      {props.digitalGift ? <DigitalGiftSection gift={props.digitalGift} /> : null}
      <WishesSection />
      <SongketDivider flipped />
      <FooterSection footer={props.footer} />
    </div>
  );
}

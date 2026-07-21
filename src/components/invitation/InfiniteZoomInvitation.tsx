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
// InfiniteZoomInvitation — REVISI v2 "Satu Mural Rumah Gadang"
//
// SATU scene besar (mural) berisi aset `luxury-parallax-minang`
// (sky, cloud x4, gunung-kerinci, pohon, rumah-gadang-hero) + foto hero
// (PNG/WEBP transparan, TANPA frame lingkaran — dia berdiri "di depan"
// rumah gadang secara alami karena latarnya transparan). Kamera (scroll)
// berpindah dari satu titik ke titik lain DI DALAM mural yang sama:
//
//   1.  cover              → mural penuh, nama tamu & judul tampil
//   2.  opening             → geser ke awan atas, kartu pesan pembuka
//   3.  hero-photo            → zoom ke foto mempelai berdiri depan rumah gadang
//   4.  bride-focus            → zoom ke sisi mempelai wanita di foto
//   5.  bride-info              → geser sedikit lagi ke samping, kartu nama & ortu
//   6.  mid-breather             → zoom out sedikit (jeda sebelum ke mempelai pria)
//   7.  groom-focus               → zoom ke sisi mempelai pria di foto
//   8.  groom-info                 → geser sedikit ke samping, kartu nama & ortu
//   9.  countdown                   → zoom ke "belakang" mempelai, kartu hitung mundur
//   10. event-akad                    → zoom out agak jauh, kartu detail akad
//   11. event-resepsi                   → pindah ke awan lain, kartu detail resepsi
//   12+ love-story-N                      → satu bab kisah cinta per awan (dinamis)
//   N-1 gallery                             → turun depan rumah gadang, agak nyamping, galeri foto
//   N   cover-out                             → zoom out penuh, balik persis seperti cover
//
// Setelah waypoint terakhir, halaman lanjut SCROLL NORMAL (bukan
// scroll-jacking) langsung ke: RSVP, Digital Gift, Ucapan, lalu penutup.
// Semua section lain (sapaan, kisah cinta, profil mempelai, detail acara,
// countdown, galeri) sudah tercakup DI DALAM mural sesuai permintaan.
//
// STATUS: masih standalone, belum disambung ke SectionRenderer/template
// system. Cek halaman tes di src/app/dev/infinite-zoom/page.tsx.
//
// CATATAN JUJUR soal kalibrasi kamera:
// - Ground layer (gunung-kerinci, rumah-gadang-hero) sekarang SAMA-SAMA
//   bottom-anchored (bottom-0, w-full) — bukan lagi pakai offset
//   bottom-[30%] yang bikin gunung "mengambang" terpisah. Kedua aset itu
//   memang didesain landscape lebar senada (rasio ~1.57), jadi cukup
//   ditumpuk dari bawah dan komposisinya sudah menyatu dengan sendirinya.
// - Asumsi kiri=mempelai wanita, kanan=mempelai pria di dalam foto hero.
//   Kalau posisi aslinya kebalik, tinggal tukar cx pada waypoint
//   bride-focus/bride-info dengan groom-focus/groom-info.
// - Titik (cx, cy) & zoom di WAYPOINTS dikalibrasi visual untuk layar HP
//   (~420px). Kalau ada kartu yang kepotong/nabrak, geser angkanya saja,
//   tidak perlu ubah struktur.
//
// CATATAN JUJUR soal RSVP / Digital Gift / Wishes:
// Masih bentuk visual + form standalone (belum tersambung ke API submit
// asli). Sambungkan lewat prop `onSubmitRsvp`, atau ganti dengan
// <SectionRenderer /> begitu sistem template sudah di-wire.
// ---------------------------------------------------------------------------

const ASSET = "/templates/luxury-parallax-minang";

// Satuan kanvas bebas ("cu"), BUKAN pixel layar. Portrait — dekat rasio asli
// sky.webp (1013x1800) supaya object-cover tidak banyak memotong.
const CANVAS = { width: 1000, height: 1800 };

interface CameraWaypoint {
  id: string;
  cx: number;
  cy: number;
  zoom: number;
}

interface StoryCloudSlot {
  file: string;
  cardCx: number;
  cardCy: number;
  style: { top: string; left?: string; right?: string; width: string };
  mirror?: boolean;
}

const STORY_CLOUD_SLOTS: StoryCloudSlot[] = [
  { file: "cloud-03.webp", cardCx: 220, cardCy: 420, style: { top: "16%", left: "-8%", width: "46%" } },
  { file: "cloud-04.webp", cardCx: 780, cardCy: 380, style: { top: "9%", left: "58%", width: "42%" } },
  { file: "cloud-01.webp", cardCx: 430, cardCy: 640, style: { top: "27%", left: "18%", width: "38%" }, mirror: true },
  { file: "cloud-02.webp", cardCx: 700, cardCy: 700, style: { top: "31%", left: "48%", width: "36%" }, mirror: true },
];

const OPENING_CLOUD = { file: "cloud-01.webp", cardCx: 460, cardCy: 190, style: { top: "2%", left: "-10%", width: "50%" } };
const RESEPSI_CLOUD = { file: "cloud-02.webp", cardCx: 780, cardCy: 230, style: { top: "5%", right: "-8%", width: "46%" } };

/** Bangun urutan waypoint kamera secara dinamis, tergantung jumlah acara & bab kisah cinta. */
function buildWaypoints(eventsCount: number, storyCount: number): CameraWaypoint[] {
  const wps: CameraWaypoint[] = [
    { id: "cover", cx: 500, cy: 900, zoom: 0.42 },
    { id: "opening", cx: OPENING_CLOUD.cardCx, cy: OPENING_CLOUD.cardCy, zoom: 1.55 },
    { id: "hero-photo", cx: 500, cy: 1450, zoom: 1.45 },
    { id: "bride-focus", cx: 390, cy: 1380, zoom: 2.2 },
    { id: "bride-info", cx: 150, cy: 1380, zoom: 1.9 },
    { id: "mid-breather", cx: 500, cy: 1420, zoom: 1.3 },
    { id: "groom-focus", cx: 610, cy: 1380, zoom: 2.2 },
    { id: "groom-info", cx: 850, cy: 1380, zoom: 1.9 },
    { id: "countdown", cx: 500, cy: 1050, zoom: 1.8 },
  ];
  if (eventsCount > 0) wps.push({ id: "event-0", cx: 500, cy: 1280, zoom: 0.75 });
  if (eventsCount > 1) wps.push({ id: "event-1", cx: RESEPSI_CLOUD.cardCx, cy: RESEPSI_CLOUD.cardCy, zoom: 1.55 });
  const storySlots = STORY_CLOUD_SLOTS.slice(0, Math.min(storyCount, STORY_CLOUD_SLOTS.length));
  storySlots.forEach((slot, i) => {
    wps.push({ id: `love-story-${i}`, cx: slot.cardCx, cy: slot.cardCy, zoom: 1.55 });
  });
  wps.push({ id: "gallery", cx: 250, cy: 1650, zoom: 1.55 });
  wps.push({ id: "cover-out", cx: 500, cy: 900, zoom: 0.42 });
  return wps;
}

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
  /** Nama tamu — tampil di cover (waypoint pertama & terakhir). */
  guestName?: string;
  /** "Ayu & Bagas" — dipakai di cover & footer. */
  coupleNames: string;
  coverEyebrow?: string;
  coverDateLabel?: string;
  /** Foto mempelai (PNG/WEBP transparan) yang berdiri di depan rumah gadang. */
  couplePhotoUrl: string;

  openingMessage: { eyebrow?: string; body: string };

  /** Asumsi: sisi kiri foto = mempelai wanita, sisi kanan = mempelai pria. */
  bride: InfiniteZoomPersonProfile;
  groom: InfiniteZoomPersonProfile;

  /** events[0] dipakai untuk kartu "zoom out agak jauh", events[1] untuk kartu di awan. Sisanya opsional, hanya tampil di fallback statis. */
  events: InfiniteZoomEventDetail[];
  countdownTarget?: string | Date;

  /** Satu bab = satu awan. Maksimal 4 bab yang dapat kebagian awan sendiri. */
  loveStory?: InfiniteZoomLoveStoryChapter[];

  gallery?: string[];

  digitalGift?: { message?: string; accounts?: InfiniteZoomGiftAccount[]; qrisImageUrl?: string };

  footer: { coupleNames: string; dateLabel?: string; message?: string };

  onSubmitRsvp?: (formData: FormData) => void;
}

// ---------------------------------------------------------------------------
// Hook kecil: countdown, dipakai di dalam mural & di fallback statis.
// ---------------------------------------------------------------------------

function useCountdown(target: string | Date) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });
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
  return remaining;
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
  const { onSubmitRsvp } = props;
  const storyCount = props.loveStory?.length ?? 0;
  const waypoints = buildWaypoints(props.events.length, storyCount);
  const n = waypoints.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const breakpoints = waypoints.map((_, i) => i / (n - 1));
  const cxMV = useTransform(scrollYProgress, breakpoints, waypoints.map((w) => w.cx));
  const cyMV = useTransform(scrollYProgress, breakpoints, waypoints.map((w) => w.cy));
  const zoomMV = useTransform(scrollYProgress, breakpoints, waypoints.map((w) => w.zoom));

  const translateX = useTransform([cxMV, zoomMV], (v) => {
    const [cx, zoom] = v as number[];
    return `calc(50vw - ${cx * zoom}px)`;
  });
  const translateY = useTransform([cyMV, zoomMV], (v) => {
    const [cy, zoom] = v as number[];
    return `calc(50vh - ${cy * zoom}px)`;
  });

  // Teks cover (eyebrow, judul, nama tamu) hanya kelihatan jelas saat di
  // waypoint "cover" & "cover-out" — cepat pudar begitu kamera mulai
  // bergerak, dan muncul lagi menjelang kamera kembali ke framing awal.
  const seg = 1 / (n - 1);
  const coverTextOpacity = useTransform(scrollYProgress, [0, seg * 0.4, 1 - seg * 0.4, 1], [1, 0, 0, 1]);

  return (
    <div className="relative bg-theme-bg">
      {/* --- Bagian 1: mural rumah gadang, scroll-jacked, n waypoint --- */}
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
            <MinangMuralScene {...props} coverTextOpacity={coverTextOpacity} />
          </motion.div>

          <ScrollProgressHint progress={scrollYProgress} />
        </div>
      </div>

      {/* --- Bagian 2: divider Minang, penanda transisi ke scroll normal --- */}
      <SongketDivider />

      {/* --- Bagian 3: RSVP, digital gift, ucapan — scroll normal --- */}
      <RsvpSection guestName={props.guestName} onSubmitRsvp={onSubmitRsvp} />
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
  bride,
  groom,
  events,
  countdownTarget,
  loveStory = [],
  gallery = [],
  coverTextOpacity,
}: InfiniteZoomInvitationProps & { coverTextOpacity?: MotionValue<number> }) {
  const storySlots = STORY_CLOUD_SLOTS.slice(0, Math.min(loveStory.length, STORY_CLOUD_SLOTS.length));
  const akadEvent = events[0];
  const resepsiEvent = events[1];

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* --- Langit --- */}
      {/* eslint-disable @next/next/no-img-element */}
      <img src={`${ASSET}/sky.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />

      {/* --- Awan pesan pembuka --- */}
      <CloudDecoration file={OPENING_CLOUD.file} style={OPENING_CLOUD.style} />

      {/* --- Awan resepsi (kalau ada acara ke-2) --- */}
      {resepsiEvent ? <CloudDecoration file={RESEPSI_CLOUD.file} style={RESEPSI_CLOUD.style} /> : null}

      {/* --- Awan kisah cinta, satu per bab --- */}
      {storySlots.map((slot, i) => (
        <CloudDecoration key={i} file={slot.file} style={slot.style} mirror={slot.mirror} />
      ))}

      {/* --- Tanah: gunung, rumah gadang, foto mempelai, pohon — semua bottom-anchored jadi satu gambar utuh --- */}
      <img src={`${ASSET}/gunung-kerinci.webp`} alt="" className="absolute bottom-0 left-0 w-full" />
      <img src={`${ASSET}/rumah-gadang-hero.webp`} alt="" className="absolute bottom-0 left-[7.5%] w-[85%]" />
      <img
        src={couplePhotoUrl}
        alt=""
        className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2 drop-shadow-[0_18px_28px_rgba(0,0,0,0.35)]"
      />
      <img src={`${ASSET}/pohon-01.webp`} alt="" className="absolute bottom-0 left-[-3%] w-[24%]" />
      <img src={`${ASSET}/pohon-02.webp`} alt="" className="absolute bottom-0 right-[-3%] w-[26%]" />
      <img src={`${ASSET}/top-ornament.webp`} alt="" className="absolute top-0 left-0 w-full" />
      {/* eslint-enable @next/next/no-img-element */}

      {/* --- Teks cover: eyebrow atas + judul, tanggal, nama tamu bawah --- */}
      <motion.div className="absolute top-[7%] w-full text-center" style={{ opacity: coverTextOpacity ?? 1 }}>
        <p className="font-theme-body text-[11px] uppercase tracking-[0.4em] text-[#EEDFBE]/90">{coverEyebrow}</p>
      </motion.div>
      <motion.div className="absolute top-[52%] w-full text-center" style={{ opacity: coverTextOpacity ?? 1 }}>
        <h1 className="font-theme-heading text-2xl text-[#FFFDF8]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          {coupleNames}
        </h1>
        {coverDateLabel ? <p className="mt-1 font-theme-body text-xs text-[#EEDFBE]/85">{coverDateLabel}</p> : null}
        {guestName ? (
          <p className="mt-2 inline-block rounded-full bg-black/25 px-4 py-1 font-theme-body text-xs text-[#FFFDF8] backdrop-blur-sm">
            Kepada Yth. {guestName}
          </p>
        ) : null}
      </motion.div>

      {/* --- Waypoint: pesan pembuka --- */}
      <Positioned cx={OPENING_CLOUD.cardCx} cy={OPENING_CLOUD.cardCy} width={420}>
        <OpeningCardContent openingMessage={openingMessage} />
      </Positioned>

      {/* --- Waypoint: caption kecil di foto hero --- */}
      <Positioned cx={500} cy={1730} width={320}>
        <p className="text-center font-theme-heading text-lg italic text-[#FFFDF8]" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
          {coupleNames}
        </p>
      </Positioned>

      {/* --- Waypoint: info mempelai wanita --- */}
      <Positioned cx={150} cy={1380} width={260}>
        <PersonInfoCard person={bride} roleLabel="Mempelai Wanita" />
      </Positioned>

      {/* --- Waypoint: info mempelai pria --- */}
      <Positioned cx={850} cy={1380} width={260}>
        <PersonInfoCard person={groom} roleLabel="Mempelai Pria" />
      </Positioned>

      {/* --- Waypoint: countdown, "di belakang" mempelai --- */}
      {countdownTarget ? (
        <Positioned cx={500} cy={1050} width={300}>
          <CountdownCardContent target={countdownTarget} />
        </Positioned>
      ) : null}

      {/* --- Waypoint: detail akad, zoom out agak jauh --- */}
      {akadEvent ? (
        <Positioned cx={500} cy={1280} width={420}>
          <EventCardContent event={akadEvent} />
        </Positioned>
      ) : null}

      {/* --- Waypoint: detail resepsi, di awan --- */}
      {resepsiEvent ? (
        <Positioned cx={RESEPSI_CLOUD.cardCx} cy={RESEPSI_CLOUD.cardCy} width={360}>
          <EventCardContent event={resepsiEvent} />
        </Positioned>
      ) : null}

      {/* --- Waypoint: kisah cinta, satu kartu per awan --- */}
      {storySlots.map((slot, i) => (
        <Positioned key={i} cx={slot.cardCx} cy={slot.cardCy} width={320}>
          <LoveStoryCardContent chapter={loveStory[i]} />
        </Positioned>
      ))}

      {/* --- Waypoint: galeri foto, depan rumah gadang, agak nyamping --- */}
      {gallery.length > 0 ? (
        <Positioned cx={250} cy={1650} width={340}>
          <GalleryCardContent photos={gallery} coupleNames={coupleNames} />
        </Positioned>
      ) : null}
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

function CloudDecoration({
  file,
  style,
  mirror,
}: {
  file: string;
  style: { top: string; left?: string; right?: string; width: string };
  mirror?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${ASSET}/${file}`}
      alt=""
      className="absolute opacity-80"
      style={{ ...style, transform: mirror ? "scaleX(-1)" : undefined }}
    />
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
// Konten kartu "murni" (tanpa positioning) — dipakai DI DALAM mural lewat
// <Positioned>, dan dipakai lagi apa adanya di fallback statis lewat <div>
// biasa. Supaya isinya konsisten di kedua mode tanpa duplikasi.
// ---------------------------------------------------------------------------

function OpeningCardContent({ openingMessage }: { openingMessage: { eyebrow?: string; body: string } }) {
  return (
    <div className="rounded-2xl bg-theme-surface/95 px-6 py-5 text-center shadow-floating backdrop-blur-sm">
      {openingMessage.eyebrow ? (
        <p className="mb-2 font-theme-body text-[11px] uppercase tracking-[0.3em] text-theme-muted">{openingMessage.eyebrow}</p>
      ) : null}
      <p className="font-theme-body text-sm leading-relaxed text-theme-text">{openingMessage.body}</p>
    </div>
  );
}

function PersonInfoCard({ person, roleLabel }: { person: InfiniteZoomPersonProfile; roleLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-theme-surface/95 px-4 py-5 text-center shadow-floating backdrop-blur-sm">
      <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-theme-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={person.photoUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <p className="font-theme-body text-[10px] uppercase tracking-[0.25em] text-theme-secondary">{roleLabel}</p>
      <p className="font-theme-heading text-lg text-theme-primary">{person.name}</p>
      <p className="font-theme-body text-xs text-theme-muted">{person.parents}</p>
    </div>
  );
}

function CountdownCardContent({ target }: { target: string | Date }) {
  const remaining = useCountdown(target);
  return (
    <div className="rounded-2xl bg-theme-surface/95 px-4 py-4 text-center shadow-floating backdrop-blur-sm">
      <p className="mb-2 font-theme-body text-[11px] uppercase tracking-[0.25em] text-theme-muted">Menuju Hari Bahagia</p>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Hari", value: remaining.d },
          { label: "Jam", value: remaining.h },
          { label: "Menit", value: remaining.m },
          { label: "Detik", value: remaining.s },
        ].map((u) => (
          <div key={u.label} className="rounded-lg border border-theme-border py-2">
            <p className="font-theme-heading text-lg text-theme-primary">{u.value}</p>
            <p className="font-theme-body text-[9px] uppercase tracking-[0.15em] text-theme-muted">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventCardContent({ event }: { event: InfiniteZoomEventDetail }) {
  return (
    <div className="rounded-2xl bg-theme-surface/95 px-5 py-5 text-center shadow-floating backdrop-blur-sm">
      <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-secondary">{event.label}</p>
      {event.dateLabel ? <p className="mt-2 font-theme-heading text-lg text-theme-primary">{event.dateLabel}</p> : null}
      <p className="mt-1 font-theme-body text-sm text-theme-text">{event.timeLabel}</p>
      {event.venueName ? <p className="mt-3 font-theme-body text-sm text-theme-muted">{event.venueName}</p> : null}
      {event.address ? <p className="font-theme-body text-xs text-theme-muted">{event.address}</p> : null}
      {event.mapsUrl ? (
        <a
          href={event.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-md bg-theme-primary px-5 py-2 font-theme-body text-xs font-medium text-white shadow-soft"
        >
          Lihat Lokasi
        </a>
      ) : null}
    </div>
  );
}

function LoveStoryCardContent({ chapter }: { chapter?: InfiniteZoomLoveStoryChapter }) {
  if (!chapter) return null;
  return (
    <div className="rounded-2xl bg-theme-surface/95 px-5 py-5 text-center shadow-floating backdrop-blur-sm">
      {chapter.year ? <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-secondary">{chapter.year}</p> : null}
      <p className="mt-1 font-theme-heading text-lg text-theme-primary">{chapter.title}</p>
      <p className="mt-1 font-theme-body text-sm text-theme-muted">{chapter.body}</p>
    </div>
  );
}

function GalleryCardContent({ photos, coupleNames }: { photos: string[]; coupleNames: string }) {
  const shown = photos.slice(0, 4);
  return (
    <div className="relative rounded-xl bg-[#3E2A1B] p-3 shadow-floating">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ASSET}/flower-01.webp`} alt="" className="pointer-events-none absolute -left-6 -top-6 w-20" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ASSET}/flower-02.webp`} alt="" className="pointer-events-none absolute -right-6 -top-4 w-16" />
      <div className="grid grid-cols-2 gap-1.5">
        {shown.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" className="aspect-square w-full rounded-md object-cover" />
        ))}
      </div>
      <p className="mt-2 text-center font-theme-heading text-sm text-[#FFFDF8]">Galeri Kami</p>
      <p className="text-center font-theme-body text-[10px] uppercase tracking-[0.25em] text-[#EEDFBE]/80">{coupleNames}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section standar setelah mural — RSVP, digital gift, ucapan, footer.
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
// Fallback non-animasi untuk `prefers-reduced-motion` — cover statis (mural
// tanpa scroll-jacking) lalu semua konten yang tadinya "tersembunyi" di
// waypoint kamera ditampilkan berurutan sebagai stack section biasa, pakai
// komponen konten "murni" yang sama supaya isinya tetap konsisten.
// ---------------------------------------------------------------------------

function StaticFallback(props: InfiniteZoomInvitationProps) {
  const { guestName, coupleNames, coverEyebrow = "The Wedding of", coverDateLabel, openingMessage, bride, groom, events, countdownTarget, loveStory = [], gallery = [] } = props;

  return (
    <div className="bg-theme-bg">
      <div className="relative aspect-[10/18] w-full max-w-sm mx-auto overflow-hidden">
        <MinangMuralScene {...props} />
      </div>
      <div className="px-6 py-8 text-center">
        <p className="font-theme-body text-[11px] uppercase tracking-[0.4em] text-theme-muted">{coverEyebrow}</p>
        <h1 className="mt-2 font-theme-heading text-2xl text-theme-primary">{coupleNames}</h1>
        {coverDateLabel ? <p className="mt-1 font-theme-body text-xs text-theme-muted">{coverDateLabel}</p> : null}
        {guestName ? <p className="mt-1 font-theme-body text-xs text-theme-muted">Kepada Yth. {guestName}</p> : null}
      </div>

      <SongketDivider />

      <SectionTexture className="px-6 py-12">
        <div className="mx-auto max-w-md">
          <OpeningCardContent openingMessage={openingMessage} />
        </div>
      </SectionTexture>

      <SectionTexture className="px-6 py-12">
        <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Mempelai</h2>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-4">
          <PersonInfoCard person={bride} roleLabel="Mempelai Wanita" />
          <PersonInfoCard person={groom} roleLabel="Mempelai Pria" />
        </div>
      </SectionTexture>

      {countdownTarget ? (
        <SectionTexture className="px-6 py-12">
          <div className="mx-auto max-w-xs">
            <CountdownCardContent target={countdownTarget} />
          </div>
        </SectionTexture>
      ) : null}

      {events.length > 0 ? (
        <SectionTexture className="px-6 py-12">
          <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Rangkaian Acara</h2>
          <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
            {events.map((ev) => (
              <EventCardContent key={ev.id} event={ev} />
            ))}
          </div>
        </SectionTexture>
      ) : null}

      {loveStory.length > 0 ? (
        <SectionTexture className="px-6 py-12">
          <h2 className="text-center font-theme-heading text-2xl text-theme-primary">Kisah Kami</h2>
          <div className="mx-auto mt-6 max-w-md space-y-4">
            {loveStory.map((chapter, i) => (
              <LoveStoryCardContent key={i} chapter={chapter} />
            ))}
          </div>
        </SectionTexture>
      ) : null}

      {gallery.length > 0 ? (
        <SectionTexture className="px-6 py-12">
          <div className="mx-auto max-w-sm">
            <GalleryCardContent photos={gallery} coupleNames={coupleNames} />
          </div>
        </SectionTexture>
      ) : null}

      <SongketDivider />

      <RsvpSection guestName={guestName} onSubmitRsvp={props.onSubmitRsvp} />
      {props.digitalGift ? <DigitalGiftSection gift={props.digitalGift} /> : null}
      <WishesSection />
      <SongketDivider flipped />
      <FooterSection footer={props.footer} />
    </div>
  );
}

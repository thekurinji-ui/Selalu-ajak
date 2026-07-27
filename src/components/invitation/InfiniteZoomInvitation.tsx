"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

// ---------------------------------------------------------------------------
// InfiniteZoomInvitation — REVISI v3 "Mural Berlapis (Depth Parallax)"
//
// Dua perbaikan dari revisi sebelumnya:
//
// 1) FADE IN/OUT PER SECTION
//    Setiap kartu konten (pesan pembuka, info mempelai, countdown, detail
//    acara, kisah cinta, galeri) sekarang TERSEMBUNYI (opacity 0) selama
//    kamera belum sampai di waypoint-nya, MUNCUL (opacity 1) tepat saat
//    kamera berhenti di waypoint itu, lalu MENGHILANG lagi begitu kamera
//    lanjut ke waypoint berikutnya. Kurva opacity-nya segitiga (0→1→0)
//    dipatok ke breakpoint scroll milik masing-masing kartu — lihat
//    `useSectionOpacity`.
//
// 2) LAYER 3D BERLAPIS (DEPTH PARALLAX)
//    Mural sekarang bukan satu kanvas datar, tapi ~9 "lapisan kedalaman"
//    (langit → awan → gunung → [di belakang] → rumah gadang → [konten
//    tengah] → foto mempelai → galeri → pohon depan), MASING-MASING punya
//    kecepatan zoom sendiri relatif terhadap titik referensi (lihat
//    `DEPTH` & `useDepthTransform`). Lapisan yang "jauh" (langit, gunung,
//    awan) zoom & bergeser LEBIH LAMBAT; lapisan yang "dekat" (foto
//    mempelai, pohon depan) zoom & bergeser LEBIH CEPAT — itu yang bikin
//    efek "berlapis-lapis, 3D" pas scroll.
//    Countdown SENGAJA ditaruh di lapisan "behind" (lebih jauh dari
//    referensi) dan digambar SEBELUM lapisan foto mempelai di DOM, jadi
//    foto mempelai (PNG transparan) betul-betul menutupinya dari depan —
//    kartu countdown hanya "mengintip" dari sela-sela transparan sekitar
//    siluet mempelai, persis kayak dia ada di belakang mereka.
//
// Semua lapisan tetap dianchor ke titik zoom yang SAMA (ZOOM_BASE = zoom
// waypoint "cover") supaya di framing cover semua lapisan tetap presisi
// menyatu jadi satu gambar utuh — parallax-nya baru "terasa" begitu kamera
// mulai zoom masuk, dan balik menyatu lagi begitu zoom out ke cover-out.
//
// STATUS: masih standalone, belum disambung ke SectionRenderer/template
// system. Cek halaman tes di src/app/dev/infinite-zoom/page.tsx.
//
// CATATAN JUJUR:
// - Komposisi ground layer mengikuti referensi: pohon dibuat LEBIH KECIL
//   (18-19% lebar, bukan ~25%) dan jadi backdrop selapis dengan gunung
//   (DEPTH.treesBg, di BELAKANG rumah gadang & foto) — bukan pohon besar
//   di paling depan seperti revisi sebelumnya. Foto mempelai juga
//   diperkecil (38% lebar) biar proporsional dengan rumah gadang. Ada
//   list songket tipis tambahan di dasar mural (dekat kaki mempelai)
//   sebagai pasangan top-ornament di atas.
// - Depth exponent per lapisan (lihat `DEPTH`) dikalibrasi rasa/visual,
//   bukan hasil pengukuran fisik. Kalau efek parallax-nya kurang/kelewat
//   kerasa di satu lapisan tertentu, cukup naik/turunkan angkanya sedikit
//   (semakin jauh dari 1.0, semakin terasa "jauh"/"dekat" lapisan itu).
// - Fade opacity dipatok segitiga PAS di breakpoint waypoint kartu itu.
//   Kalau mau durasi "muncul penuh"-nya lebih lama (bukan sekejap), tinggal
//   ganti array input `useTransform` di `useSectionOpacity` dari 3 titik
//   jadi 4-5 titik dengan sedikit plateau di tengah.
// - Asumsi kiri=mempelai wanita, kanan=mempelai pria di foto hero. Kartu
//   akad sengaja digeser ke sisi kanan rumah (bukan tepat di atas foto)
//   supaya tidak ketutup lapisan foto saat kamera zoom out lebar.
// ---------------------------------------------------------------------------

const ASSET = "/templates/luxury-parallax-minang";

// Satuan kanvas bebas ("cu"), BUKAN pixel layar.
const CANVAS = { width: 1000, height: 1800 };

// Zoom di waypoint "cover" — jadi titik referensi tempat SEMUA lapisan
// depth selalu presisi menyatu (lihat useDepthTransform).
const ZOOM_BASE = 0.42;

// Eksponen kedalaman per lapisan. 1.0 = lapisan referensi (rumah gadang).
// <1 = lebih "jauh" dari kamera (zoom & geser lebih lambat).
// >1 = lebih "dekat" dari kamera (zoom & geser lebih cepat/dramatis).
const DEPTH = {
  sky: 0.15,
  clouds: 0.45,
  mountain: 0.55,
  treesBg: 0.68,
  behind: 0.85,
  house: 1.0,
  midContent: 1.08,
  photo: 1.15,
  gallery: 1.2,
};

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
    { id: "cover", cx: 500, cy: 900, zoom: ZOOM_BASE },
    { id: "opening", cx: OPENING_CLOUD.cardCx, cy: OPENING_CLOUD.cardCy, zoom: 1.55 },
    { id: "hero-photo", cx: 500, cy: 1420, zoom: 1.4 },
    { id: "bride-focus", cx: 390, cy: 1380, zoom: 2.2 },
    { id: "bride-info", cx: 150, cy: 1380, zoom: 1.9 },
    { id: "mid-breather", cx: 500, cy: 1420, zoom: 1.3 },
    { id: "groom-focus", cx: 610, cy: 1380, zoom: 2.2 },
    { id: "groom-info", cx: 850, cy: 1380, zoom: 1.9 },
    { id: "countdown", cx: 500, cy: 1390, zoom: 1.75 },
  ];
  if (eventsCount > 0) wps.push({ id: "event-0", cx: 800, cy: 1550, zoom: 0.85 });
  if (eventsCount > 1) wps.push({ id: "event-1", cx: RESEPSI_CLOUD.cardCx, cy: RESEPSI_CLOUD.cardCy, zoom: 1.55 });
  const storySlots = STORY_CLOUD_SLOTS.slice(0, Math.min(storyCount, STORY_CLOUD_SLOTS.length));
  storySlots.forEach((slot, i) => {
    wps.push({ id: `love-story-${i}`, cx: slot.cardCx, cy: slot.cardCy, zoom: 1.55 });
  });
  wps.push({ id: "gallery", cx: 280, cy: 1650, zoom: 1.55 });
  wps.push({ id: "cover-out", cx: 500, cy: 900, zoom: ZOOM_BASE });
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
          <MinangMuralScene
            {...props}
            waypoints={waypoints}
            scrollYProgress={scrollYProgress}
            cxMV={cxMV}
            cyMV={cyMV}
            zoomMV={zoomMV}
            coverTextOpacity={coverTextOpacity}
          />
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
// Depth parallax — inti dari efek "3D berlapis". Setiap DepthLayer punya
// kecepatan zoom/geser sendiri, relatif ke ZOOM_BASE, berdasarkan exponent
// kedalamannya. Di ZOOM_BASE (waypoint cover), semua lapisan presisi sama
// — parallax baru "muncul" begitu kamera zoom menyimpang dari ZOOM_BASE.
// ---------------------------------------------------------------------------

function useDepthTransform(cxMV: MotionValue<number>, cyMV: MotionValue<number>, zoomMV: MotionValue<number>, depth: number) {
  const layerZoomMV = useTransform(zoomMV, (z) => ZOOM_BASE * Math.pow(z / ZOOM_BASE, depth));
  const x = useTransform([cxMV, layerZoomMV], (v) => {
    const [cx, lz] = v as number[];
    return `calc(50vw - ${cx * lz}px)`;
  });
  const y = useTransform([cyMV, layerZoomMV], (v) => {
    const [cy, lz] = v as number[];
    return `calc(50vh - ${cy * lz}px)`;
  });
  return { x, y, scale: layerZoomMV };
}

function DepthLayer({
  depth,
  zIndex,
  cxMV,
  cyMV,
  zoomMV,
  children,
}: {
  depth: number;
  zIndex: number;
  cxMV: MotionValue<number>;
  cyMV: MotionValue<number>;
  zoomMV: MotionValue<number>;
  children: ReactNode;
}) {
  const { x, y, scale } = useDepthTransform(cxMV, cyMV, zoomMV, depth);
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: CANVAS.width, height: CANVAS.height, x, y, scale, transformOrigin: "0 0", zIndex }}
    >
      {children}
    </motion.div>
  );
}

/** Opacity segitiga (0 → 1 → 0) yang mekar tepat di breakpoint waypoint `id`. */
function useSectionOpacity(scrollYProgress: MotionValue<number>, waypoints: CameraWaypoint[], id: string) {
  const n = waypoints.length;
  const rawIndex = waypoints.findIndex((w) => w.id === id);
  const index = rawIndex >= 0 ? rawIndex : 0;
  const bp = index / (n - 1);
  const prev = index > 0 ? (index - 1) / (n - 1) : Math.max(0, bp - 0.001);
  const next = index < n - 1 ? (index + 1) / (n - 1) : Math.min(1, bp + 0.001);
  return useTransform(scrollYProgress, [prev, bp, next], [0, 1, 0]);
}

// ---------------------------------------------------------------------------
// Mural rumah gadang — dipecah jadi beberapa DepthLayer (lihat DEPTH),
// disusun dari yang paling jauh ke paling dekat supaya urutan tumpang-
// tindihnya benar (layer belakangan digambar di atas layer sebelumnya).
// ---------------------------------------------------------------------------

interface MuralCameraProps {
  waypoints: CameraWaypoint[];
  scrollYProgress: MotionValue<number>;
  cxMV: MotionValue<number>;
  cyMV: MotionValue<number>;
  zoomMV: MotionValue<number>;
  coverTextOpacity: MotionValue<number>;
}

function MinangMuralScene(props: InfiniteZoomInvitationProps & MuralCameraProps) {
  const {
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
    waypoints,
    scrollYProgress,
    cxMV,
    cyMV,
    zoomMV,
    coverTextOpacity,
  } = props;

  const storySlots = STORY_CLOUD_SLOTS.slice(0, Math.min(loveStory.length, STORY_CLOUD_SLOTS.length));
  const akadEvent = events[0];
  const resepsiEvent = events[1];

  const layer = (depth: number, zIndex: number, children: ReactNode) => (
    <DepthLayer depth={depth} zIndex={zIndex} cxMV={cxMV} cyMV={cyMV} zoomMV={zoomMV}>
      {children}
    </DepthLayer>
  );

  const openingOpacity = useSectionOpacity(scrollYProgress, waypoints, "opening");
  const heroPhotoOpacity = useSectionOpacity(scrollYProgress, waypoints, "hero-photo");
  const brideInfoOpacity = useSectionOpacity(scrollYProgress, waypoints, "bride-info");
  const groomInfoOpacity = useSectionOpacity(scrollYProgress, waypoints, "groom-info");
  const countdownOpacity = useSectionOpacity(scrollYProgress, waypoints, "countdown");
  const event0Opacity = useSectionOpacity(scrollYProgress, waypoints, "event-0");
  const event1Opacity = useSectionOpacity(scrollYProgress, waypoints, "event-1");
  const galleryOpacity = useSectionOpacity(scrollYProgress, waypoints, "gallery");
  // Awan kisah cinta maksimal 4 — dipanggil tetap 4x (bukan di dalam .map)
  // supaya jumlah pemanggilan hook selalu konsisten antar-render.
  const loveStoryOpacities = [
    useSectionOpacity(scrollYProgress, waypoints, "love-story-0"),
    useSectionOpacity(scrollYProgress, waypoints, "love-story-1"),
    useSectionOpacity(scrollYProgress, waypoints, "love-story-2"),
    useSectionOpacity(scrollYProgress, waypoints, "love-story-3"),
  ];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EFE7D2]">
      {/* --- Lapisan 1: langit — paling jauh, hampir diam --- */}
      {layer(
        DEPTH.sky,
        0,
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${ASSET}/sky.webp`} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {/* --- Lapisan 2: awan + kartu pesan pembuka, resepsi, kisah cinta --- */}
      {layer(
        DEPTH.clouds,
        10,
        <>
          <CloudDecoration file={OPENING_CLOUD.file} style={OPENING_CLOUD.style} />
          {resepsiEvent ? <CloudDecoration file={RESEPSI_CLOUD.file} style={RESEPSI_CLOUD.style} /> : null}
          {storySlots.map((slot, i) => (
            <CloudDecoration key={i} file={slot.file} style={slot.style} mirror={slot.mirror} />
          ))}

          <Positioned cx={OPENING_CLOUD.cardCx} cy={OPENING_CLOUD.cardCy} width={420} opacity={openingOpacity}>
            <OpeningCardContent openingMessage={openingMessage} />
          </Positioned>

          {resepsiEvent ? (
            <Positioned cx={RESEPSI_CLOUD.cardCx} cy={RESEPSI_CLOUD.cardCy} width={360} opacity={event1Opacity}>
              <EventCardContent event={resepsiEvent} />
            </Positioned>
          ) : null}

          {storySlots.map((slot, i) => (
            <Positioned key={i} cx={slot.cardCx} cy={slot.cardCy} width={320} opacity={loveStoryOpacities[i]}>
              <LoveStoryCardContent chapter={loveStory[i]} />
            </Positioned>
          ))}
        </>
      )}

      {/* --- Lapisan 3: gunung — jauh, di belakang rumah gadang --- */}
      {layer(
        DEPTH.mountain,
        20,
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${ASSET}/gunung-kerinci.webp`} alt="" className="absolute bottom-0 left-0 w-full" />
      )}

      {/* --- Lapisan 3b: pohon — backdrop kecil di kiri-kanan, selapis dengan gunung, DI BELAKANG rumah gadang & foto (bukan foreground) --- */}
      {layer(
        DEPTH.treesBg,
        25,
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/pohon-01.webp`} alt="" className="absolute top-[58%] left-[-4%] w-[18%]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/pohon-02.webp`} alt="" className="absolute top-[54%] right-[-4%] w-[19%]" />
        </>
      )}

      {/* --- Lapisan 4: countdown — SENGAJA di lapisan lebih "jauh" dari foto mempelai, digambar SEBELUM lapisan foto supaya benar-benar tertutup dari depan --- */}
      {countdownTarget ? (
        layer(
          DEPTH.behind,
          30,
          <Positioned cx={500} cy={1390} width={300} opacity={countdownOpacity}>
            <CountdownCardContent target={countdownTarget} />
          </Positioned>
        )
      ) : null}

      {/* --- Lapisan 5: rumah gadang + teks cover + kartu akad --- */}
      {layer(
        DEPTH.house,
        40,
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/rumah-gadang-hero.webp`} alt="" className="absolute bottom-0 left-[7.5%] w-[85%]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/top-ornament.w

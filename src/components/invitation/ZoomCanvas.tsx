"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

// ---------------------------------------------------------------------------
// ZoomCanvas — prototipe "kanvas raksasa" buat undangan gaya zoomable-canvas
// (mirip Prezi): tiap adegan (cover, nama tamu, pesan pembuka, profil
// mempelai, detail acara, galeri, RSVP, gift, wish) ditaruh di titik X,Y
// tertentu di satu kanvas besar. Scroll menggerakkan "kamera" (posisi X,Y +
// level zoom) dari satu titik ke titik berikutnya sesuai urutan cerita —
// bisa ke kanan, kiri, atas, bawah, bebas — bukan cuma membesar di tempat.
//
// STATUS: standalone/prototipe. Belum disambung ke SectionRenderer, template
// system, atau /i/[slug]. Lihat halaman tes di src/app/dev/zoom-canvas/page.tsx.
//
// CATATAN JUJUR soal RSVP / Digital Gift / Wishes (baca sebelum lanjut ke
// tahap produksi):
// Di prototipe ini, 3 waypoint terakhir (`rsvp`, `gift`, `wish`) sengaja
// masih PLACEHOLDER (visual doang, belum form beneran). Naruh form aktif
// (input, tombol submit) di dalam elemen yang ikut di-scale/translate itu
// bisa, tapi perlu kerjaan tambahan yang belum digarap di sini:
//  1. Scene yang lagi tidak difokus kamera perlu `pointer-events: none`,
//     supaya user nggak kepencet input yang keliatan sedikit di pinggir
//     layar padahal belum "aktif".
//  2. Tap ke <input> di HP sering memicu browser auto-scroll/zoom sendiri,
//     yang bisa~ bentrok sama transform scroll-jacking kanvas ini — perlu
//     dites khusus di iOS Safari & Chrome Android.
//  3. Aksesibilitas (keyboard/screen reader) buat "lompat" ke RSVP yang
//     posisinya di tengah kanvas raksasa perlu jalur alternatif tersendiri.
// Rekomendasi: kalau prototipe spatial ini sudah oke rasanya, RSVP/Gift/Wish
// tetap disambungkan ke komponen asli yang sudah ada (`SectionRenderer`)
// begitu kamera "mendarat" di area itu — bukan dibangun ulang dari nol di
// dalam kanvas transform ini.
// ---------------------------------------------------------------------------

interface Waypoint {
  id: string;
  /** Titik pusat konten di kanvas (satuan bebas, "cu" = canvas unit). */
  cx: number;
  cy: number;
  /** Lebar/tinggi kotak konten di titik ini, dipakai buat nge-posisiin isinya. */
  w: number;
  h: number;
  /** Level zoom kamera saat "mendarat" di titik ini. <1 = zoom out (lihat luas), >1 = zoom in (lihat detail). */
  zoom: number;
}

// Referensi kalibrasi: nilai zoom di bawah dihitung supaya tiap kotak
// konten kira-kira memenuhi lebar layar HP (~420px). Di layar lebar
// (desktop) efeknya bakal kelihatan sedikit "lebih jauh" dari yang
// dikalibrasi — itu batasan yang masih perlu diperbaiki di iterasi
// berikutnya (auto-scale mengikuti lebar viewport asli), bukan bug.
const WAYPOINTS: Waypoint[] = [
  { id: "cover", cx: 600, cy: 750, w: 900, h: 1400, zoom: 0.46 },
  { id: "guest", cx: 1450, cy: 500, w: 380, h: 220, zoom: 1.1 },
  { id: "opening", cx: 1950, cy: 780, w: 360, h: 260, zoom: 1.15 },
  { id: "couple-photo", cx: 2550, cy: 550, w: 700, h: 900, zoom: 0.6 },
  { id: "mempelai-a", cx: 3200, cy: 480, w: 420, h: 520, zoom: 1.0 },
  { id: "mempelai-b", cx: 2700, cy: 1150, w: 420, h: 520, zoom: 1.0 },
  { id: "event-akad", cx: 1950, cy: 1450, w: 380, h: 300, zoom: 1.05 },
  { id: "event-resepsi", cx: 2500, cy: 1650, w: 380, h: 300, zoom: 1.05 },
  { id: "gallery", cx: 3300, cy: 1500, w: 1000, h: 700, zoom: 0.5 },
  { id: "rsvp", cx: 4100, cy: 1200, w: 420, h: 560, zoom: 1.0 },
  { id: "gift", cx: 4650, cy: 900, w: 420, h: 480, zoom: 1.0 },
  { id: "wish", cx: 5150, cy: 1200, w: 420, h: 480, zoom: 1.0 },
];

const CANVAS = { width: 5600, height: 2100 };

export interface ZoomCanvasInvitationProps {
  guestName?: string;
  eventName?: string;
}

export function ZoomCanvasInvitation({ guestName, eventName = "Ayu & Bagas" }: ZoomCanvasInvitationProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <StaticFallback guestName={guestName} eventName={eventName} />;
  }

  return <CameraRig guestName={guestName} eventName={eventName} />;
}

function CameraRig({ guestName, eventName }: { guestName?: string; eventName: string }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollAreaRef, offset: ["start start", "end end"] });

  const n = WAYPOINTS.length;
  const breakpoints = WAYPOINTS.map((_, i) => i / (n - 1));
  const cxMV = useTransform(scrollYProgress, breakpoints, WAYPOINTS.map((w) => w.cx));
  const cyMV = useTransform(scrollYProgress, breakpoints, WAYPOINTS.map((w) => w.cy));
  const zoomMV = useTransform(scrollYProgress, breakpoints, WAYPOINTS.map((w) => w.zoom));

  // Titik (cx, cy) harus selalu jatuh di tengah layar (50vw, 50vh) berapa pun
  // level zoom-nya — makanya translasinya ikut dikalikan zoom juga.
  const translateX = useTransform([cxMV, zoomMV], (v) => {
    const [cx, zoom] = v as number[];
    return `calc(50vw - ${cx * zoom}px)`;
  });
  const translateY = useTransform([cyMV, zoomMV], (v) => {
    const [cy, zoom] = v as number[];
    return `calc(50vh - ${cy * zoom}px)`;
  });

  return (
    <div className="relative bg-[#0f1410]">
      <div ref={scrollAreaRef} className="relative" style={{ height: `${n * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
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
            <SceneBox wp={WAYPOINTS[0]}>
              <CoverScene guestName={guestName} eventName={eventName} />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[1]}>
              <TextCard eyebrow="Kepada Yth." title={guestName?.trim() ? guestName : "Tamu Undangan"} />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[2]}>
              <TextCard
                eyebrow="Assalamu'alaikum"
                title="Pesan Pembuka"
                body="Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu."
              />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[3]}>
              <PhotoCard imageUrl="/FotoDemo/hero-photo.webp" caption="Ayu & Bagas" />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[4]}>
              <ProfileCard
                imageUrl="/FotoDemo/foto-wanita.webp"
                eyebrow="Mempelai Wanita"
                name="Ayu Lestari"
                parents="Putri pertama dari Bapak Sutrisno & Ibu Wulan"
              />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[5]}>
              <ProfileCard
                imageUrl="/FotoDemo/foto-pria.webp"
                eyebrow="Mempelai Pria"
                name="Bagas Wicaksono"
                parents="Putra kedua dari Bapak Hartono & Ibu Ratna"
              />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[6]}>
              <TextCard eyebrow="Akad Nikah" title="08.00 - 10.00 WIB" body="Kediaman Mempelai Wanita, Jakarta Selatan" />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[7]}>
              <TextCard eyebrow="Resepsi" title="11.00 - 14.00 WIB" body="Grand Ballroom, Jakarta" />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[8]}>
              <GalleryScene />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[9]}>
              <PlaceholderCard label="RSVP" note="Nanti disambungkan ke komponen RSVP asli (SectionRenderer), bukan dibangun ulang di sini." />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[10]}>
              <PlaceholderCard label="Digital Gift" note="Nanti disambungkan ke komponen Digital Gift asli." />
            </SceneBox>
            <SceneBox wp={WAYPOINTS[11]}>
              <PlaceholderCard label="Ucapan / Wishes" note="Nanti disambungkan ke komponen Wishes asli." />
            </SceneBox>
          </motion.div>

          <ProgressHint progress={scrollYProgress} />
        </div>
      </div>
    </div>
  );
}

function SceneBox({ wp, children }: { wp: Waypoint; children: ReactNode }) {
  return (
    <div
      className="absolute"
      style={{ left: wp.cx - wp.w / 2, top: wp.cy - wp.h / 2, width: wp.w, height: wp.h }}
    >
      {children}
    </div>
  );
}

// --- Scene: Cover (pakai aset luxury-parallax-minang + hero-photo demo) ---
function CoverScene({ guestName, eventName }: { guestName?: string; eventName: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* eslint-disable @next/next/no-img-element */}
      <img src="/templates/luxury-parallax-minang/sky.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <img
        src="/templates/luxury-parallax-minang/cloud-01.webp"
        alt=""
        className="absolute left-[-8%] top-[6%] w-[55%] opacity-80"
      />
      <img
        src="/templates/luxury-parallax-minang/cloud-03.webp"
        alt=""
        className="absolute right-[-6%] top-[14%] w-[45%] opacity-75"
      />
      <img
        src="/templates/luxury-parallax-minang/gunung-kerinci.webp"
        alt=""
        className="absolute bottom-[30%] left-0 w-full"
      />
      <img
        src="/templates/luxury-parallax-minang/pohon-01.webp"
        alt=""
        className="absolute bottom-0 left-[-2%] w-[22%]"
      />
      <img
        src="/templates/luxury-parallax-minang/pohon-02.webp"
        alt=""
        className="absolute bottom-0 right-[-2%] w-[20%]"
      />
      <img
        src="/templates/luxury-parallax-minang/rumah-gadang-hero.webp"
        alt=""
        className="absolute bottom-[6%] left-[7.5%] w-[85%]"
      />
      <img
        src="/templates/luxury-parallax-minang/top-ornament.webp"
        alt=""
        className="absolute top-0 left-0 w-full"
      />

      {/* Foto pasangan sebagai centerpiece depan, framed */}
      <div className="absolute left-1/2 top-[32%] w-[46%] -translate-x-1/2 overflow-hidden rounded-full border-[6px] border-[#EEDFBE] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <img src="/FotoDemo/hero-photo.webp" alt="" className="aspect-square w-full object-cover" />
      </div>

      <div className="absolute top-[10%] w-full text-center">
        <p className="font-theme-body text-[11px] uppercase tracking-[0.4em] text-[#EEDFBE]/90">The Wedding of</p>
      </div>
      <div className="absolute bottom-[2%] w-full text-center">
        <h1 className="font-theme-heading text-2xl text-[#FFFDF8]" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          {eventName}
        </h1>
        {guestName ? (
          <p className="mt-1 font-theme-body text-xs text-[#EEDFBE]/80">Kepada Yth. {guestName}</p>
        ) : null}
      </div>
    </div>
  );
}

function TextCard({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-theme-surface px-6 text-center shadow-floating">
      {eyebrow ? <p className="mb-2 font-theme-body text-[11px] uppercase tracking-[0.3em] text-theme-muted">{eyebrow}</p> : null}
      <h2 className="font-theme-heading text-xl text-theme-primary">{title}</h2>
      {body ? <p className="mt-2 font-theme-body text-sm text-theme-text">{body}</p> : null}
    </div>
  );
}

function PhotoCard({ imageUrl, caption }: { imageUrl: string; caption?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-floating">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {caption ? (
        <p className="absolute bottom-4 w-full text-center font-theme-heading text-lg text-white">{caption}</p>
      ) : null}
    </div>
  );
}

function ProfileCard({
  imageUrl,
  eyebrow,
  name,
  parents,
}: {
  imageUrl: string;
  eyebrow: string;
  name: string;
  parents: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-theme-surface p-6 text-center shadow-floating">
      <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-theme-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      </div>
      <p className="font-theme-body text-[11px] uppercase tracking-[0.3em] text-theme-muted">{eyebrow}</p>
      <h2 className="font-theme-heading text-xl text-theme-primary">{name}</h2>
      <p className="font-theme-body text-sm text-theme-text">{parents}</p>
    </div>
  );
}

function GalleryScene() {
  const photos = [
    "/FotoDemo/gallery-01.webp",
    "/FotoDemo/gallery-02.webp",
    "/FotoDemo/gallery-03.webp",
    "/FotoDemo/gallery-04.webp",
    "/FotoDemo/gallery-05.webp",
    "/FotoDemo/gallery-06.webp",
  ];
  return (
    <div className="grid h-full w-full grid-cols-3 gap-2 rounded-2xl bg-theme-surface p-2 shadow-floating">
      {photos.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" className="h-full w-full rounded-lg object-cover" />
      ))}
    </div>
  );
}

function PlaceholderCard({ label, note }: { label: string; note: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-theme-border bg-theme-surface/60 px-6 text-center">
      <h2 className="font-theme-heading text-xl text-theme-primary">{label}</h2>
      <p className="font-theme-body text-xs text-theme-muted">{note}</p>
    </div>
  );
}

function ProgressHint({ progress }: { progress: MotionValue<number> }) {
  const barHeight = useTransform(progress, [0, 1], ["4%", "100%"]);
  return (
    <div className="pointer-events-none absolute bottom-8 right-6 z-50 hidden h-24 w-[3px] overflow-hidden rounded-full bg-white/25 mix-blend-difference sm:block">
      <motion.div className="w-full rounded-full bg-white" style={{ height: barHeight }} />
    </div>
  );
}

/** Fallback non-animasi untuk `prefers-reduced-motion` — urut ke bawah biasa, tanpa scroll-jacking/kanvas 2D. */
function StaticFallback({ guestName, eventName }: { guestName?: string; eventName: string }) {
  return (
    <div className="flex flex-col gap-3 bg-theme-bg p-4">
      <div className="aspect-[9/14] w-full max-w-sm self-center overflow-hidden rounded-2xl">
        <CoverScene guestName={guestName} eventName={eventName} />
      </div>
      <TextCard eyebrow="Kepada Yth." title={guestName?.trim() ? guestName : "Tamu Undangan"} />
      <TextCard eyebrow="Assalamu'alaikum" title="Pesan Pembuka" body="Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu." />
      <div className="aspect-[7/9] w-full max-w-sm self-center overflow-hidden rounded-2xl">
        <PhotoCard imageUrl="/FotoDemo/hero-photo.webp" caption="Ayu & Bagas" />
      </div>
      <ProfileCard imageUrl="/FotoDemo/foto-wanita.webp" eyebrow="Mempelai Wanita" name="Ayu Lestari" parents="Putri pertama dari Bapak Sutrisno & Ibu Wulan" />
      <ProfileCard imageUrl="/FotoDemo/foto-pria.webp" eyebrow="Mempelai Pria" name="Bagas Wicaksono" parents="Putra kedua dari Bapak Hartono & Ibu Ratna" />
      <TextCard eyebrow="Akad Nikah" title="08.00 - 10.00 WIB" body="Kediaman Mempelai Wanita, Jakarta Selatan" />
      <TextCard eyebrow="Resepsi" title="11.00 - 14.00 WIB" body="Grand Ballroom, Jakarta" />
      <div className="h-64 w-full max-w-sm self-center">
        <GalleryScene />
      </div>
      <PlaceholderCard label="RSVP" note="Komponen RSVP asli dipasang di sini." />
      <PlaceholderCard label="Digital Gift" note="Komponen Digital Gift asli dipasang di sini." />
      <PlaceholderCard label="Ucapan / Wishes" note="Komponen Wishes asli dipasang di sini." />
    </div>
  );
}

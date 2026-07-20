"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

// ---------------------------------------------------------------------------
// InfiniteZoomInvitation
//
// Pengalaman "satu tarikan napas" dari sapaan tamu sampai footer, tersambung
// lewat efek continuous zoom yang mengikuti scroll — kamera terasa terus
// menembus dari satu frame ke frame berikutnya tanpa putus.
//
// STATUS: standalone. BELUM disambungkan ke `SectionRenderer`, `layoutMode`
// template, atau routing publik `/i/[slug]`. Sengaja dibuat berdiri sendiri
// dulu supaya bisa dites terisolasi (lihat halaman contoh di
// `src/app/dev/infinite-zoom/page.tsx`) sebelum di-wire ke sistem template &
// builder yang sudah ada — jadi sampai tahap "wiring" itu dikerjakan,
// template lain 100% tidak tersentuh oleh file ini.
//
// Cara kerja singkat:
// - Total tinggi wrapper = jumlah frame x 100vh, supaya ada "jarak scroll"
//   yang cukup buat tiap frame merasakan zoom penuh.
// - Di dalamnya ada panel `sticky top-0 h-screen` — jadi secara visual
//   posisinya diam di layar, sementara scroll cuma dipakai sebagai
//   "kemudi" progress animasi (pola umum untuk scroll-jacked zoom).
// - Tiap frame (`ZoomFrame`) dapat jatah 1/n dari total progress scroll.
//   Di jatahnya: muncul membesar dari kecil -> penuh -> (kalau bukan frame
//   terakhir) terus membesar & pudar seolah ditembus kamera menuju frame
//   berikutnya, yang pada saat bersamaan baru mulai membesar dari kecil.
// - Frame terakhir tidak "ditembus" — dia diam di scale=1 sampai user keluar
//   dari area sticky, lalu discroll biasa menuju Footer.
// - Kalau device/browser user set `prefers-reduced-motion`, seluruh trik
//   scroll-jacking dimatikan otomatis, diganti stack section biasa (lihat
//   `StaticFallback`) — biar tidak memicu pusing/mual buat yang sensitif.
// ---------------------------------------------------------------------------

export interface InfiniteZoomScene {
  id: string;
  imageUrl?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export interface InfiniteZoomFooterContent {
  coupleNames: string;
  dateLabel?: string;
  message?: string;
}

export interface InfiniteZoomInvitationProps {
  /** Nama tamu — dipakai otomatis sebagai frame pembuka ("Kepada Yth. ..."). */
  guestName?: string;
  /** Nama acara, tampil sebagai sub-teks di frame pembuka. */
  eventName: string;
  /** Urutan frame di antara sapaan tamu dan footer. Minimal 1 scene. */
  scenes: InfiniteZoomScene[];
  footer: InfiniteZoomFooterContent;
  /** Slot opsional buat naruh section lain (RSVP, maps, dst) di bawah footer nanti. */
  footerChildren?: ReactNode;
}

export function InfiniteZoomInvitation({
  guestName,
  eventName,
  scenes,
  footer,
  footerChildren,
}: InfiniteZoomInvitationProps) {
  const prefersReducedMotion = useReducedMotion();

  const frames: InfiniteZoomScene[] = [
    {
      id: "__greeting",
      eyebrow: "Kepada Yth.",
      title: guestName?.trim() ? guestName : "Tamu Undangan",
      subtitle: eventName,
    },
    ...scenes,
  ];

  if (prefersReducedMotion) {
    return <StaticFallback frames={frames} footer={footer} footerChildren={footerChildren} />;
  }

  return <ZoomExperience frames={frames} footer={footer} footerChildren={footerChildren} />;
}

function ZoomExperience({
  frames,
  footer,
  footerChildren,
}: {
  frames: InfiniteZoomScene[];
  footer: InfiniteZoomFooterContent;
  footerChildren?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div className="relative bg-theme-bg">
      <div ref={containerRef} className="relative" style={{ height: `${frames.length * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {frames.map((frame, i) => (
            <ZoomFrame key={frame.id} frame={frame} index={i} total={frames.length} progress={scrollYProgress} />
          ))}
          <ScrollProgressHint progress={scrollYProgress} />
        </div>
      </div>

      <FooterSection footer={footer}>{footerChildren}</FooterSection>
    </div>
  );
}

function ZoomFrame({
  frame,
  index,
  total,
  progress,
}: {
  frame: InfiniteZoomScene;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const segLen = 1 / total;
  const segStart = index * segLen;
  const segEnd = segStart + segLen;
  const isLast = index === total - 1;

  // Titik-titik dalam jatah segmen ini: 18% pertama buat "muncul" membesar
  // dari kecil ke penuh, ditahan sampai 70% biar sempat kebaca, sisanya
  // (kalau bukan frame terakhir) dipakai buat terus membesar & memudar.
  const appearEnd = segStart + segLen * 0.18;
  const holdEnd = segStart + segLen * 0.7;

  const scaleInput = isLast ? [segStart, appearEnd, holdEnd] : [segStart, appearEnd, holdEnd, segEnd];
  const scaleOutput = isLast ? [0.55, 1, 1] : [0.55, 1, 1, 2.6];

  const opacityInput = isLast
    ? [segStart, appearEnd, 1]
    : [segStart, appearEnd, segEnd - segLen * 0.12, segEnd];
  const opacityOutput = isLast ? [0, 1, 1] : [0, 1, 1, 0];

  const scale = useTransform(progress, scaleInput, scaleOutput);
  const opacity = useTransform(progress, opacityInput, opacityOutput);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
      style={{ scale, opacity, zIndex: index, willChange: "transform, opacity" }}
    >
      {frame.imageUrl ? (
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frame.imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      ) : null}

      <div className={frame.imageUrl ? "text-white" : "text-theme-text"}>
        {frame.eyebrow ? (
          <p className="mb-3 font-theme-body text-xs uppercase tracking-[0.3em] opacity-80">{frame.eyebrow}</p>
        ) : null}
        <h2 className="font-theme-heading text-3xl leading-tight sm:text-5xl">{frame.title}</h2>
        {frame.subtitle ? (
          <p className="mt-4 font-theme-body text-base opacity-90 sm:text-lg">{frame.subtitle}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

/** Indikator progress tipis di kanan bawah, biar user sadar ini scroll "terkendali", bukan macet. */
function ScrollProgressHint({ progress }: { progress: MotionValue<number> }) {
  const barHeight = useTransform(progress, [0, 1], ["6%", "100%"]);

  return (
    <div className="pointer-events-none absolute bottom-8 right-6 z-50 hidden h-24 w-[3px] overflow-hidden rounded-full bg-white/25 mix-blend-difference sm:block">
      <motion.div className="w-full rounded-full bg-white" style={{ height: barHeight }} />
    </div>
  );
}

function FooterSection({ footer, children }: { footer: InfiniteZoomFooterContent; children?: ReactNode }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-theme-bg px-6 py-24 text-center">
      <p className="font-theme-body text-xs uppercase tracking-[0.3em] text-theme-muted">Dengan penuh syukur</p>
      <h2 className="font-theme-heading text-4xl text-theme-primary sm:text-5xl">{footer.coupleNames}</h2>
      {footer.dateLabel ? <p className="font-theme-body text-theme-muted">{footer.dateLabel}</p> : null}
      {footer.message ? (
        <p className="max-w-md font-theme-body text-theme-text">{footer.message}</p>
      ) : null}
      {children}
    </section>
  );
}

/** Fallback non-animasi untuk `prefers-reduced-motion` — stack section biasa, tanpa scroll-jacking. */
function StaticFallback({
  frames,
  footer,
  footerChildren,
}: {
  frames: InfiniteZoomScene[];
  footer: InfiniteZoomFooterContent;
  footerChildren?: ReactNode;
}) {
  return (
    <div className="bg-theme-bg">
      {frames.map((frame) => (
        <section
          key={frame.id}
          className="relative flex min-h-[70vh] flex-col items-center justify-center px-8 text-center"
        >
          {frame.imageUrl ? (
            <div className="absolute inset-0 -z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.imageUrl} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/35" />
            </div>
          ) : null}
          <div className={frame.imageUrl ? "text-white" : "text-theme-text"}>
            {frame.eyebrow ? (
              <p className="mb-3 font-theme-body text-xs uppercase tracking-[0.3em] opacity-80">{frame.eyebrow}</p>
            ) : null}
            <h2 className="font-theme-heading text-3xl sm:text-5xl">{frame.title}</h2>
            {frame.subtitle ? (
              <p className="mt-4 font-theme-body opacity-90 sm:text-lg">{frame.subtitle}</p>
            ) : null}
          </div>
        </section>
      ))}
      <FooterSection footer={footer}>{footerChildren}</FooterSection>
    </div>
  );
}

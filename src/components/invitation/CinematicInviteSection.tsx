"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import { formatDateID } from "@/lib/utils";
import type { SectionInstance } from "@/lib/invitation-sections";
import type { InvitationEventContext } from "./SectionRenderer";

// BAB 10.5 (tambahan) — Cinematic Intro Section.
// Pengalaman "gerbang" bergaya browsing platform streaming: splash judul →
// pilih profil tamu → hero pembuka, lalu section-section lain di bawahnya
// baru tampil. Dipasang sebagai section PERTAMA pada sebuah invitation.
// Catatan: ini adaptasi orisinal terinspirasi UX platform streaming, bukan
// reproduksi aset/branding pihak ketiga manapun (logo, warna, & suara dibuat
// sendiri) — aman dipakai sebagai salah satu Template Premium.
//
// section.data yang didukung:
// - posterUrl        : gambar splash/poster utama
// - chimeUrl          : (opsional) file suara pendek untuk transisi splash
// - accentLabel        : label kecil di splash (default "SELALU AJAK")
// - openButtonLabel    : label tombol buka undangan (default "Mulai")

interface CinematicInviteSectionProps {
  section: SectionInstance;
  event: InvitationEventContext;
  guestName?: string;
}

type Phase = "splash" | "profile" | "revealed";

export function CinematicInviteSection({ section, event, guestName }: CinematicInviteSectionProps) {
  const [phase, setPhase] = useState<Phase>("splash");
  const [isMuted, setIsMuted] = useState(false);

  const posterUrl: string | undefined = section.data.posterUrl || event.coverImageUrl || undefined;
  const chimeUrl: string | undefined = section.data.chimeUrl;
  const accentLabel: string = section.data.accentLabel || "SELALU AJAK";
  const openButtonLabel: string = section.data.openButtonLabel || "Mulai";
  const displayName = guestName || "Tamu Undangan";

  useEffect(() => {
    if (phase !== "splash") return;
    if (chimeUrl && !isMuted) {
      const audio = new Audio(chimeUrl);
      audio.play().catch(() => {
        /* autoplay bisa diblokir browser, itu wajar — abaikan */
      });
    }
    const timer = setTimeout(() => setPhase("profile"), 2200);
    return () => clearTimeout(timer);
  }, [phase, chimeUrl, isMuted]);

  if (phase === "revealed") {
    // Setelah dibuka, section ini hilang dan section berikutnya (event_info,
    // story, gallery, rsvp, dst.) tampil normal di bawahnya.
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-theme-bg text-theme-text">
      <button
        onClick={() => setIsMuted((m) => !m)}
        className="absolute right-4 top-4 z-10 rounded-full bg-theme-surface/70 p-2 text-theme-text backdrop-blur"
        aria-label={isMuted ? "Aktifkan suara" : "Bisukan suara"}
        type="button"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <AnimatePresence mode="wait">
        {phase === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4 px-6 text-center"
          >
            <motion.p
              initial={{ letterSpacing: "0.15em", opacity: 0.6 }}
              animate={{ letterSpacing: "0.35em", opacity: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="font-heading text-xs uppercase text-theme-secondary"
            >
              {accentLabel}
            </motion.p>
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-heading text-3xl font-semibold text-theme-primary md:text-5xl"
            >
              {event.name}
            </motion.h1>
          </motion.div>
        )}

        {phase === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 px-6 text-center"
          >
            <h2 className="font-heading text-xl text-theme-muted">Untuk siapa undangan ini?</h2>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase("revealed")}
              className="flex flex-col items-center gap-3"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-theme-primary text-3xl font-heading font-semibold text-white shadow-soft">
                {displayName.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <span className="font-heading text-lg text-theme-text">{displayName}</span>
            </motion.button>
            <p className="max-w-xs text-xs text-theme-muted">
              {event.date && `${formatDateID(event.date)} · `}
              {event.location || "Ketuk profil untuk membuka undangan"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {posterUrl && phase === "profile" && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      {phase === "profile" && (
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setPhase("revealed")}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-theme-primary px-6 py-2.5 text-sm font-medium text-white shadow-soft"
        >
          <Play size={16} />
          {openButtonLabel}
        </motion.button>
      )}
    </div>
  );
            }

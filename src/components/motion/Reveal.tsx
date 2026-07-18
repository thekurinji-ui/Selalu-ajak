"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { MOTION_DEFAULTS, type MotionConfig } from "@/lib/motion-config";

/**
 * Kategori "Reveal Animation" dari Motion Engine Blueprint (subset v1).
 * Trigger sekali saat elemen masuk viewport — bukan continuous scroll effect
 * (itu tugasnya ScrollCamera). Kalau `config.reveal` kosong/"none", render
 * biasa tanpa animasi (dan tanpa wrapper motion, biar ringan).
 */

const VARIANTS: Record<Exclude<NonNullable<MotionConfig["reveal"]>, "none">, { hidden: object; visible: object }> = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } },
  "slide-left": { hidden: { opacity: 0, x: -48 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 48 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
  // Curtain: elemen "dibuka" dari bawah pakai clip-path, kesannya seperti tirai.
  curtain: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    visible: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
  },
};

export function Reveal({
  config,
  className,
  style,
  children,
}: {
  config?: MotionConfig;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const type = config?.reveal ?? "none";

  if (type === "none") {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const variant = VARIANTS[type];
  const duration = config?.duration ?? MOTION_DEFAULTS.revealDuration;
  const delay = config?.delay ?? MOTION_DEFAULTS.delay;
  const easing = config?.easing ?? MOTION_DEFAULTS.easing;

  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={variant}
      transition={{ duration, delay, ease: easing }}
    >
      {children}
    </motion.div>
  );
}

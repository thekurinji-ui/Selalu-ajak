"use client";

import { motion } from "framer-motion";
import { INTENSITY_SCALE, MOTION_DEFAULTS, type MotionConfig } from "@/lib/motion-config";

/**
 * Kategori "Image Effect" dari blueprint — subset v1: ken-burns saja.
 * Beda dari ScrollCamera: efek ini jalan otomatis begitu foto muncul
 * (time-based, sekali jalan pelan-pelan), TIDAK terikat posisi scroll.
 * Jadi foto tetap "hidup" walau user berhenti scroll — sesuai gaya
 * dokumenter/film klasik yang jadi asal nama efek ini.
 */
export function KenBurnsImage({
  src,
  alt = "",
  config,
  className,
}: {
  src: string;
  alt?: string;
  config?: MotionConfig;
  className?: string;
}) {
  if (config?.imageEffect !== "ken-burns") {
    return <img src={src} alt={alt} className={className} />;
  }

  const intensity = INTENSITY_SCALE[config?.intensity ?? MOTION_DEFAULTS.intensity];
  const duration = config?.duration ?? MOTION_DEFAULTS.kenBurnsDuration;

  return (
    <div className={`${className ?? ""} overflow-hidden`}>
      <motion.img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        initial={{ scale: 1, x: "0%", y: "0%" }}
        animate={{ scale: 1 + 0.12 * intensity, x: `-${3 * intensity}%`, y: `-${3 * intensity}%` }}
        transition={{ duration, ease: "easeOut" }}
      />
    </div>
  );
}

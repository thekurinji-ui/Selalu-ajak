"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { INTENSITY_SCALE, MOTION_DEFAULTS, type MotionConfig } from "@/lib/motion-config";

/**
 * Gabungan kategori "Camera Motion" (zoom-in/zoom-out) dan "Parallax System"
 * (vertical) dari blueprint — digabung dalam satu komponen karena keduanya
 * sama-sama continuous scroll effect dan enak pakai satu `useScroll` listener
 * saja per elemen (lebih hemat, sesuai prinsip performa di blueprint #13).
 *
 * `parallax: "multi-layer"` di v1 ini diperlakukan sama seperti "vertical"
 * untuk satu layer. Untuk bikin kedalaman berlapis beneran, bungkus 2+
 * ScrollCamera terpisah dengan `intensity` berbeda pada layer background vs
 * konten (background lebih intens = kelihatan lebih "jauh"/lambat).
 *
 * Kalau `camera` dan `parallax` sama-sama "none"/kosong, komponen ini gak
 * pasang listener scroll sama sekali — render div biasa.
 */
export function ScrollCamera({
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
  const hasCamera = !!config?.camera && config.camera !== "none";
  const hasParallax = !!config?.parallax && config.parallax !== "none";

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const intensity = INTENSITY_SCALE[config?.intensity ?? MOTION_DEFAULTS.intensity];

  const zoomRange: [number, number] =
    config?.camera === "zoom-out" ? [1 + 0.18 * intensity, 1] : [1, 1 + 0.18 * intensity];
  const scale = useTransform(scrollYProgress, [0, 1], hasCamera ? zoomRange : [1, 1]);

  const yRange: [string, string] = [`-${8 * intensity}%`, `${8 * intensity}%`];
  const y = useTransform(scrollYProgress, [0, 1], hasParallax ? yRange : ["0%", "0%"]);

  if (!hasCamera && !hasParallax) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: "hidden" }}>
      <motion.div style={{ y, scale, height: "100%", width: "100%", willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}

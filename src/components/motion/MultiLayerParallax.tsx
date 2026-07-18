"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { INTENSITY_SCALE, MOTION_DEFAULTS, type MotionIntensity } from "@/lib/motion-config";

/**
 * Kategori "Multi-Layer Parallax" dari blueprint — versi beneran (bukan
 * `ScrollCamera` dengan `parallax: "multi-layer"` yang di v1 masih diperlakukan
 * sebagai satu layer). Komponen ini menumpuk beberapa gambar (mis. langit,
 * gunung, rumah gadang, ornamen depan) dan menggerakkan tiap gambar dengan
 * kecepatan berbeda mengikuti progres scroll, jadi kelihatan berlapis/dalam.
 *
 * `speed` per layer:
 *  - 0        → diam total (mis. langit jauh banget)
 *  - 0.2–0.6  → bergerak pelan, terasa "jauh" (background)
 *  - 1        → bergerak normal
 *  - 1.4–2    → bergerak lebih cepat dari scroll, terasa "dekat" (foreground)
 *
 * Urutan array `layers` menentukan urutan tumpuk (index 0 paling belakang).
 */
export interface ParallaxLayer {
  /** URL gambar layer (disarankan PNG/WEBP transparan untuk layer non-background). */
  src: string;
  /** Kecepatan gerak relatif terhadap scroll, lihat catatan di atas. Default 1. */
  speed?: number;
  /** Opsional: geser posisi horizontal/vertikal awal, mis. "10%" ke kiri untuk gunung. */
  offsetX?: string;
  offsetY?: string;
  /** object-fit bawaan "cover"; pakai "contain" untuk elemen dekoratif yang gak boleh terpotong. */
  fit?: "cover" | "contain";
  opacity?: number;
  className?: string;
}

export function MultiLayerParallax({
  layers,
  className,
  style,
  intensity = MOTION_DEFAULTS.intensity,
}: {
  layers: ParallaxLayer[];
  className?: string;
  style?: CSSProperties;
  intensity?: MotionIntensity;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const intensityScale = INTENSITY_SCALE[intensity] ?? 1;

  if (!layers || layers.length === 0) return null;

  // Kalau caller sudah nentuin utility position sendiri lewat className (mis.
  // "absolute inset-0" dari CoverSection/EventDetailSection supaya full-bleed),
  // JANGAN timpa lewat inline style — inline style selalu menang atas class,
  // jadi override tanpa syarat di sini bikin "inset-0" gak berfungsi dan div
  // ini collapse jadi tinggi 0 (anak-anaknya semua position:absolute, gak
  // nyumbang tinggi ke parent). Fallback "relative" cuma dipasang kalau
  // caller belum nentuin position apa pun.
  const hasPositionClass = /\b(absolute|fixed|sticky|static|relative)\b/.test(className ?? "");
  const wrapperClassName = hasPositionClass ? className : `${className ?? ""} relative`;

  return (
    <div ref={ref} className={wrapperClassName} style={{ ...style, overflow: "hidden" }}>
      {layers.map((layer, i) => (
        <Layer key={i} layer={layer} scrollYProgress={scrollYProgress} intensityScale={intensityScale} zIndex={i} />
      ))}
    </div>
  );
}

function Layer({
  layer,
  scrollYProgress,
  intensityScale,
  zIndex,
}: {
  layer: ParallaxLayer;
  scrollYProgress: MotionValue<number>;
  intensityScale: number;
  zIndex: number;
}) {
  const speed = layer.speed ?? 1;
  // Rentang gerak vertikal (%) sebanding dengan speed & intensity — layer
  // "jauh" (speed kecil) gerak dikit, layer "dekat" (speed besar) gerak jauh.
  const travel = 22 * intensityScale * speed;
  const y = useTransform(scrollYProgress, [0, 1], [`-${travel}%`, `${travel}%`]);

  return (
    <motion.img
      src={layer.src}
      alt=""
      style={{
        y,
        opacity: layer.opacity ?? 1,
        left: layer.offsetX,
        top: layer.offsetY,
        objectFit: layer.fit ?? "cover",
        zIndex,
      }}
      className={`pointer-events-none absolute inset-0 h-full w-full ${layer.className ?? ""}`}
    />
  );
}

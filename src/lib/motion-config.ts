/**
 * Selalu Ajak Motion Engine — Config System (v1)
 *
 * Fondasi kecil dari blueprint motion engine yang lebih besar. Baru mengisi
 * subset yang relevan buat undangan: reveal, camera (zoom), parallax, dan
 * satu image effect (ken-burns). Kategori lain di blueprint (particle
 * engine, gyroscope parallax, orbit camera, dll) BELUM diimplementasi —
 * tambahkan di sini kalau memang dibutuhkan nanti, jangan hardcode di
 * komponen section.
 *
 * Prinsip: semua section HANYA butuh satu object `motion` di `data`-nya,
 * gak perlu ubah kode section satu-satu tiap mau kombinasi efek baru.
 *
 * Contoh pakai di JSON template:
 *   "data": {
 *     "photoUrl": "...",
 *     "motion": { "camera": "zoom-in", "parallax": "vertical", "intensity": "medium" }
 *   }
 */

export type RevealType = "none" | "fade" | "slide" | "scale" | "curtain";
export type CameraType = "none" | "zoom-in" | "zoom-out";
export type ParallaxType = "none" | "vertical" | "multi-layer";
export type ImageEffectType = "none" | "ken-burns";
export type MotionIntensity = "subtle" | "medium" | "strong";
export type MotionEasing = "easeOut" | "easeIn" | "easeInOut" | "linear";

export interface MotionConfig {
  /** Animasi masuk sekali saat section kena viewport (trigger-once). */
  reveal?: RevealType;
  /** Efek zoom yang mengikuti progres scroll (continuous, bukan trigger-once). */
  camera?: CameraType;
  /** Efek gerak lebih lambat/cepat dari scroll (continuous). */
  parallax?: ParallaxType;
  /** Efek khusus untuk elemen foto. */
  imageEffect?: ImageEffectType;
  /** Durasi dalam detik. Untuk reveal: durasi animasi masuk. Untuk ken-burns: durasi satu siklus zoom/pan. */
  duration?: number;
  /** Delay dalam detik sebelum reveal mulai. */
  delay?: number;
  easing?: MotionEasing;
  /** Seberapa kuat efek camera/parallax/ken-burns terasa. */
  intensity?: MotionIntensity;
}

export const MOTION_DEFAULTS = {
  revealDuration: 0.9,
  kenBurnsDuration: 14,
  delay: 0,
  easing: "easeOut" as MotionEasing,
  intensity: "medium" as MotionIntensity,
};

/** Faktor pengali untuk kekuatan efek camera/parallax/ken-burns. */
export const INTENSITY_SCALE: Record<MotionIntensity, number> = {
  subtle: 0.5,
  medium: 1,
  strong: 1.6,
};

/**
 * Baca config motion dari `data` sebuah section, dengan dukungan mundur
 * (backward-compatible) untuk field lama `data.scrollEffect === "parallax"`
 * yang sempat dipakai sebelum motion engine ini ada — supaya template lama
 * yang sudah terlanjur di-upload admin tetap jalan tanpa perlu diedit ulang.
 *
 * `legacyFallback` opsional: config pengganti kalau field lama itu ditemukan,
 * beda-beda tergantung section (cover vs gallery efeknya beda rasa).
 */
export function resolveMotionConfig(
  data: Record<string, unknown> | undefined,
  legacyFallback?: MotionConfig,
): MotionConfig | undefined {
  if (!data) return undefined;
  if (data.motion && typeof data.motion === "object") {
    return data.motion as MotionConfig;
  }
  if (data.scrollEffect === "parallax" && legacyFallback) {
    return legacyFallback;
  }
  return undefined;
}

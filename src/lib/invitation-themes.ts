import type { CSSProperties } from "react";

// ---------------------------------------------------------------------------
// BAB 10.6 — Theme System: ganti warna, font, dan background tema langsung
// dari Invitation Builder, tanpa mengubah struktur section (BAB 10.4).
//
// Sumber kebenaran untuk seluruh preset tema & pasangan font. Dipakai oleh:
// - ThemeDrawer (editor, pilih tema)
// - ThemeProvider (menerapkan variabel CSS di preview & halaman publik)
// - API route /api/invitation (validasi & baca-tulis field tema di Event)
// ---------------------------------------------------------------------------

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  description: string;
  colors: ThemeColors;
  fontId: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "elegant",
    label: "Elegant Klasik",
    description: "Forest Green & Champagne Gold — identitas asli Selalu Ajak.",
    colors: {
      primary: "#25402F",
      primaryDark: "#1B3022",
      secondary: "#C9A66B",
      secondaryDark: "#AD8A50",
      background: "#FFFDF8",
      surface: "#FFFFFF",
      text: "#1E2227",
      muted: "#5B6470",
      border: "#EEDFBE",
    },
    fontId: "fraunces-inter",
  },
  {
    id: "romantic-blush",
    label: "Romantis Blush",
    description: "Dusty rose lembut dengan sentuhan emas — cocok untuk pernikahan & lamaran.",
    colors: {
      primary: "#B76E79",
      primaryDark: "#8F4B55",
      secondary: "#D9B382",
      secondaryDark: "#B9925F",
      background: "#FFF6F3",
      surface: "#FFFFFF",
      text: "#4A2E2E",
      muted: "#8A6B68",
      border: "#F0D9D2",
    },
    fontId: "cormorant-nunito",
  },
  {
    id: "modern-mono",
    label: "Modern Minimalis",
    description: "Hitam-putih bersih dengan aksen abu — cocok untuk acara korporat & seminar.",
    colors: {
      primary: "#22252A",
      primaryDark: "#101214",
      secondary: "#8993A1",
      secondaryDark: "#5B6470",
      background: "#FFFFFF",
      surface: "#F7F7F8",
      text: "#22252A",
      muted: "#6B7280",
      border: "#E4E5E8",
    },
    fontId: "playfair-poppins",
  },
  {
    id: "botanical-sage",
    label: "Botanical Sage",
    description: "Sage green & terracotta hangat — nuansa taman dan alam.",
    colors: {
      primary: "#6B8F71",
      primaryDark: "#4E6E53",
      secondary: "#C08552",
      secondaryDark: "#9C6A3E",
      background: "#FAF6EE",
      surface: "#FFFFFF",
      text: "#33402F",
      muted: "#71806B",
      border: "#E4DCC6",
    },
    fontId: "fraunces-inter",
  },
  {
    id: "royal-navy",
    label: "Royal Navy & Gold",
    description: "Navy tua & emas mewah — cocok untuk acara formal dan resepsi besar.",
    colors: {
      primary: "#1F3350",
      primaryDark: "#12213A",
      secondary: "#C9A66B",
      secondaryDark: "#AD8A50",
      background: "#F7F5EF",
      surface: "#FFFFFF",
      text: "#1F2430",
      muted: "#5B6470",
      border: "#DCD6C4",
    },
    fontId: "cinzel-work",
  },
];

export const DEFAULT_THEME_ID = "elegant";

export function getThemePreset(id: string | null | undefined): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

// ---------------------------------------------------------------------------
// Font pairing — daftar tetap (bukan bebas pilih font apa pun) karena setiap
// pasangan sudah dimuat lebih dulu lewat next/font/google di layout.tsx.
// Variabel CSS-nya (--font-xxx) hanya tersedia kalau sudah didaftarkan di sana.
// ---------------------------------------------------------------------------

export interface FontPair {
  id: string;
  label: string;
  heading: string;
  body: string;
}

export const FONT_PAIRS: Record<string, FontPair> = {
  "fraunces-inter": {
    id: "fraunces-inter",
    label: "Fraunces & Inter",
    heading: "var(--font-fraunces), serif",
    body: "var(--font-inter), sans-serif",
  },
  "playfair-poppins": {
    id: "playfair-poppins",
    label: "Playfair Display & Poppins",
    heading: "var(--font-playfair), serif",
    body: "var(--font-poppins), sans-serif",
  },
  "cormorant-nunito": {
    id: "cormorant-nunito",
    label: "Cormorant Garamond & Nunito",
    heading: "var(--font-cormorant), serif",
    body: "var(--font-nunito), sans-serif",
  },
  "cinzel-work": {
    id: "cinzel-work",
    label: "Cinzel & Work Sans",
    heading: "var(--font-cinzel), serif",
    body: "var(--font-work-sans), sans-serif",
  },
};

export const FONT_PAIR_LIST = Object.values(FONT_PAIRS);

export function getFontPair(id: string | null | undefined): FontPair {
  return FONT_PAIRS[id ?? "fraunces-inter"] ?? FONT_PAIRS["fraunces-inter"];
}

// ---------------------------------------------------------------------------
// Konfigurasi tema per-Event. Field override (primaryColor, secondaryColor,
// backgroundColor) bersifat opsional — kalau kosong, dipakai warna dari preset.
// ---------------------------------------------------------------------------

export interface EventThemeFields {
  theme: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  fontId?: string | null;
}

export interface ResolvedTheme {
  presetId: string;
  colors: ThemeColors;
  fontPair: FontPair;
}

export function resolveEventTheme(event: EventThemeFields): ResolvedTheme {
  const preset = getThemePreset(event.theme);
  const colors: ThemeColors = {
    ...preset.colors,
    primary: event.primaryColor || preset.colors.primary,
    secondary: event.secondaryColor || preset.colors.secondary,
    background: event.backgroundColor || preset.colors.background,
  };
  const fontPair = getFontPair(event.fontId || preset.fontId);

  return { presetId: preset.id, colors, fontPair };
}

// Mengubah ResolvedTheme menjadi custom properties CSS (--sa-*) yang dipasang
// di root wrapper (`ThemeProvider`). Tailwind config memetakan token
// `theme-*` (mis. `bg-theme-primary`) ke variabel-variabel ini.
export function themeToCssVars(theme: ResolvedTheme): CSSProperties {
  const { colors, fontPair } = theme;
  return {
    "--sa-primary": colors.primary,
    "--sa-primary-dark": colors.primaryDark,
    "--sa-secondary": colors.secondary,
    "--sa-secondary-dark": colors.secondaryDark,
    "--sa-bg": colors.background,
    "--sa-surface": colors.surface,
    "--sa-text": colors.text,
    "--sa-muted": colors.muted,
    "--sa-border": colors.border,
    "--sa-font-heading": fontPair.heading,
    "--sa-font-body": fontPair.body,
  } as CSSProperties;
}

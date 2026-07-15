import type { Config } from "tailwindcss";

// Design tokens — Selalu Ajak Product Blueprint v2.0, BAB 2 (Brand Identity)
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Ivory White: kesederhanaan & ruang bersih
        ivory: {
          DEFAULT: "#FFFDF8",
          50: "#FFFFFF",
          100: "#FFFDF8",
          200: "#FBF7EE",
        },
        // Secondary — Champagne Gold: kehangatan & momen spesial
        champagne: {
          DEFAULT: "#C9A66B",
          50: "#F8F1E3",
          100: "#EEDFBE",
          400: "#D4B47F",
          500: "#C9A66B",
          600: "#AD8A50",
          700: "#8A6D3F",
        },
        // Accent — Forest Green: harapan, pertumbuhan, kehidupan baru
        forest: {
          DEFAULT: "#2F4F3B",
          50: "#EAF0EC",
          100: "#C9DBD0",
          400: "#3E6650",
          500: "#2F4F3B",
          600: "#25402F",
          700: "#1B3022",
        },
        // Neutral — Slate Gray: teks & elemen pendukung
        slate: {
          DEFAULT: "#5B6470",
          100: "#F1F2F4",
          400: "#8993A1",
          500: "#5B6470",
          700: "#3A4048",
          900: "#1E2227",
        },
        success: { DEFAULT: "#10B981" }, // Emerald
        warning: { DEFAULT: "#F59E0B" }, // Amber
        danger: { DEFAULT: "#E11D48" },  // Rose Red
        // Theme System (BAB 10.6) — token dinamis, nilainya diambil dari
        // variabel CSS `--sa-*` (lihat globals.css & ThemeProvider). Dipakai
        // di komponen yang tampil di dalam undangan (SectionRenderer) supaya
        // ikut berubah sesuai tema yang dipilih user per-event.
        theme: {
          primary: "var(--sa-primary)",
          "primary-dark": "var(--sa-primary-dark)",
          secondary: "var(--sa-secondary)",
          "secondary-dark": "var(--sa-secondary-dark)",
          bg: "var(--sa-bg)",
          surface: "var(--sa-surface)",
          text: "var(--sa-text)",
          muted: "var(--sa-muted)",
          border: "var(--sa-border)",
        },
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        "theme-heading": ["var(--sa-font-heading)"],
        "theme-body": ["var(--sa-font-body)"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(30, 34, 39, 0.06)",
        medium: "0 6px 16px rgba(30, 34, 39, 0.10)",
        floating: "0 12px 32px rgba(30, 34, 39, 0.16)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 400ms ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

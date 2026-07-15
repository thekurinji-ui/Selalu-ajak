import { resolveEventTheme, themeToCssVars, type EventThemeFields } from "@/lib/invitation-themes";

interface ThemeProviderProps {
  theme: EventThemeFields;
  children: React.ReactNode;
  className?: string;
}

// BAB 10.6 — Theme System. Membungkus konten undangan (SectionRenderer) dan
// menyuntikkan variabel CSS `--sa-*` sesuai tema yang dipilih user untuk
// event ini. Tailwind memetakan token `theme-*` (mis. `bg-theme-primary`,
// `font-theme-heading`) ke variabel-variabel tersebut, jadi seluruh section
// di dalamnya otomatis ikut berubah warna & font tanpa logika tambahan.
//
// Dipakai di dua tempat: PreviewCanvas (Live Preview di Builder) dan
// halaman publik /i/[slug] — sehingga hasilnya selalu identik.
export function ThemeProvider({ theme, children, className = "" }: ThemeProviderProps) {
  const resolved = resolveEventTheme(theme);
  const cssVars = themeToCssVars(resolved);

  return (
    <div
      className={`invitation-theme font-theme-body text-theme-text bg-theme-bg ${className}`}
      style={cssVars}
    >
      {children}
    </div>
  );
}

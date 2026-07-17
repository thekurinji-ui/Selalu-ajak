import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Playfair_Display,
  Poppins,
  Cormorant_Garamond,
  Nunito,
  Cinzel,
  Work_Sans,
  Bebas_Neue,
} from "next/font/google";
import "./globals.css";

// Pasangan font default brand Selalu Ajak (BAB 2.11).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Pasangan font tambahan untuk Theme System (BAB 10.6) — dimuat sekali di
// sini agar variabel CSS-nya tersedia global, lalu dipilih per-event lewat
// `fontId` (lihat src/lib/invitation-themes.ts) tanpa perlu load dinamis.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});
// Font bold-condensed untuk preset "Sinema Malam" (BAB 10.6) — kesan dramatis
// ala poster film / platform streaming.
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

// BAB 6.6 — SEO Strategy: Meta Title/Description, Open Graph, Twitter Card,
// dan robots dasar. Sitemap XML & robots.txt ada di src/app/sitemap.ts dan
// src/app/robots.ts (route handler bawaan Next.js App Router).
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://selaluajak.kurinji.asia";
const title = "Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.";
const description =
  "Platform manajemen acara digital yang membantu Anda membuat undangan, mengelola tamu, menerima RSVP, hingga mengabadikan kenangan dalam satu pengalaman yang elegan.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Selalu Ajak",
  },
  description,
  keywords: [
    "undangan digital",
    "undangan pernikahan online",
    "manajemen acara",
    "RSVP online",
    "QR check-in acara",
    "WhatsApp blast undangan",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "Selalu Ajak",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const fontVariables = [
  fraunces.variable,
  inter.variable,
  playfair.variable,
  poppins.variable,
  cormorant.variable,
  nunito.variable,
  cinzel.variable,
  workSans.variable,
  bebasNeue.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}

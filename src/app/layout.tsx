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

export const metadata: Metadata = {
  title: "Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.",
  description:
    "Platform manajemen acara digital yang membantu Anda membuat undangan, mengelola tamu, menerima RSVP, hingga mengabadikan kenangan dalam satu pengalaman yang elegan.",
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

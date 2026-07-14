import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Selalu Ajak — Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.",
  description:
    "Platform manajemen acara digital yang membantu Anda membuat undangan, mengelola tamu, menerima RSVP, hingga mengabadikan kenangan dalam satu pengalaman yang elegan.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}

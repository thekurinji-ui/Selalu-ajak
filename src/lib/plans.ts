// BAB 18.3 & 18.4 — Paket Langganan & Perbandingan Paket
// Nama paket mengikuti tema Kurinji (bunga yang mekar sekali dalam belasan
// tahun, ikonik untuk The Kurinji): Kuncup (gratis) -> Mekar -> Kurinji.

import type { Plan } from "@prisma/client";

export type PlanConfig = {
  key: Plan;
  label: string;
  price: number; // dalam Rupiah, per bulan. 0 = gratis.
  tagline: string;
  maxEvents: number; // jumlah acara aktif yang boleh dibuat — DIENFORCE di getEventUsage()
  maxGuestsPerEvent: number; // tampil di tabel fitur; belum ada enforcement teknis
  whatsappMessageLimit: number; // maks. penerima per kampanye — DIENFORCE di /api/whatsapp/campaigns/[id]/send
  qrCheckin: boolean; // tampil di tabel fitur; belum ada enforcement teknis (QR Check-in masih terbuka untuk semua paket)
  canUsePremiumTemplates: boolean; // DIENFORCE di createEvent (src/app/dashboard/events/page.tsx)
};

// Catatan: `key` tetap memakai nilai enum Prisma (BASIC/PREMIUM/ULTIMATE) —
// ini sudah dipakai sebagai nilai kolom di database (Subscription.plan,
// Invoice.plan), jadi tidak diubah supaya tidak perlu migration/backfill.
// Yang berubah cuma `label` (nama yang tampil ke user).
export const PLANS: Record<Plan, PlanConfig> = {
  BASIC: {
    key: "BASIC",
    label: "Kuncup",
    price: 0,
    tagline: "Cocok untuk mencoba layanan.",
    maxEvents: 1,
    maxGuestsPerEvent: 300,
    whatsappMessageLimit: 100,
    qrCheckin: false,
    canUsePremiumTemplates: false,
  },
  PREMIUM: {
    key: "PREMIUM",
    label: "Mekar",
    price: 149000,
    tagline: "Paket utama yang direkomendasikan.",
    maxEvents: 5,
    maxGuestsPerEvent: 1000,
    whatsappMessageLimit: 500,
    qrCheckin: true,
    canUsePremiumTemplates: true,
  },
  ULTIMATE: {
    key: "ULTIMATE",
    label: "Kurinji",
    price: 299000,
    tagline: "Untuk profesional, WO, maupun EO.",
    maxEvents: 999,
    maxGuestsPerEvent: 3000,
    whatsappMessageLimit: 2000,
    qrCheckin: true,
    canUsePremiumTemplates: true,
  },
};

export const PLAN_ORDER: Plan[] = ["BASIC", "PREMIUM", "ULTIMATE"];

// ---------------------------------------------------------------------------
// Tabel perbandingan fitur lengkap (dipakai bareng oleh landing page
// `/#harga` dan halaman Billing di dashboard) — satu sumber data biar kedua
// tempat itu nggak pernah beda-beda lagi.
//
// PENTING: sebagian besar baris di bawah ini BARU SEBATAS TAMPILAN. Yang
// benar-benar dicek oleh kode saat ini cuma `maxEvents`, `whatsappMessageLimit`,
// dan (sebagian) `qrCheckin`. Baris lain (Digital Gift multi-rekening,
// Live Streaming, Galeri Foto, Video, Musik, Watermark, Subdomain Eksklusif,
// Integrasi Kenang Kurinji, Prioritas Support) masih perlu dibangun fitur
// pembatasnya di kode masing-masing modul — lihat README bagian
// "Langkah selanjutnya".
export type FeatureValue = boolean | string;
export type FeatureRow = { label: string; values: Record<Plan, FeatureValue> };

const guestLimitLabel = (plan: Plan) =>
  `Hingga ${PLANS[plan].maxGuestsPerEvent.toLocaleString("id-ID")} Tamu`;
const messageLimitLabel = (plan: Plan) =>
  `Hingga ${PLANS[plan].whatsappMessageLimit.toLocaleString("id-ID")} Pesan`;

export const PLAN_FEATURES: FeatureRow[] = [
  {
    label: "Template",
    values: {
      BASIC: "6 Template Standar",
      PREMIUM: "Semua Template Premium",
      ULTIMATE: "Template Custom Eksklusif",
    },
  },
  { label: "Website Undangan", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  {
    label: "Guest Management",
    values: { BASIC: guestLimitLabel("BASIC"), PREMIUM: guestLimitLabel("PREMIUM"), ULTIMATE: guestLimitLabel("ULTIMATE") },
  },
  { label: "RSVP Otomatis", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  {
    label: "WhatsApp Blast",
    values: { BASIC: messageLimitLabel("BASIC"), PREMIUM: messageLimitLabel("PREMIUM"), ULTIMATE: messageLimitLabel("ULTIMATE") },
  },
  {
    label: "QR Check-in",
    values: { BASIC: PLANS.BASIC.qrCheckin, PREMIUM: PLANS.PREMIUM.qrCheckin, ULTIMATE: PLANS.ULTIMATE.qrCheckin },
  },
  {
    label: "Digital Gift",
    values: { BASIC: "1 Rekening", PREMIUM: "Hingga 3 Rekening / QRIS", ULTIMATE: "Hingga 5 Rekening / QRIS" },
  },
  { label: "Analytics", values: { BASIC: "Dasar", PREMIUM: "Lengkap", ULTIMATE: "Lengkap + Insight" } },
  { label: "Integrasi Kenang Kurinji", values: { BASIC: false, PREMIUM: false, ULTIMATE: true } },
  { label: "Edit Konten", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  { label: "Countdown", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  { label: "Love Story", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  { label: "Google Maps", values: { BASIC: true, PREMIUM: true, ULTIMATE: true } },
  { label: "Live Streaming", values: { BASIC: "1 Link", PREMIUM: "2 Link", ULTIMATE: "3 Link" } },
  { label: "Galeri Foto", values: { BASIC: "5 Foto", PREMIUM: "25 Foto", ULTIMATE: "Hingga 100 Foto" } },
  { label: "Video", values: { BASIC: "1 Video", PREMIUM: "1 Video", ULTIMATE: "3 Video" } },
  {
    label: "Musik",
    values: { BASIC: "Musik Bawaan", PREMIUM: "Upload Musik Sendiri", ULTIMATE: "Upload Musik Sendiri" },
  },
  { label: "Watermark Selalu Ajak", values: { BASIC: true, PREMIUM: true, ULTIMATE: false } },
  { label: "Subdomain Eksklusif", values: { BASIC: false, PREMIUM: false, ULTIMATE: true } },
  { label: "Prioritas Support", values: { BASIC: false, PREMIUM: false, ULTIMATE: true } },
];

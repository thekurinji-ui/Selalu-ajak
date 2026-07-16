// BAB 18.3 & 18.4 — Paket Langganan & Perbandingan Paket
// Nama paket mengikuti tema Kurinji (bunga yang mekar sekali dalam belasan
// tahun, ikonik untuk The Kurinji): Kuncup (gratis) -> Mekar -> Kurinji.

import type { Plan } from "@prisma/client";

export type PlanConfig = {
  key: Plan;
  label: string;
  price: number; // dalam Rupiah, per bulan. 0 = gratis.
  tagline: string;
  maxEvents: number; // jumlah acara aktif yang boleh dibuat
  maxGuestsPerEvent: number;
  premiumTemplates: boolean;
  whatsappBlast: boolean;
  qrCheckin: boolean;
  digitalGift: boolean;
  analytics: "Dasar" | "Lengkap" | "Lengkap + Export";
  support: string;
  storage: string;
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
    maxGuestsPerEvent: 50,
    premiumTemplates: false,
    whatsappBlast: false,
    qrCheckin: true,
    digitalGift: true,
    analytics: "Dasar",
    support: "Email",
    storage: "100 MB",
  },
  PREMIUM: {
    key: "PREMIUM",
    label: "Mekar",
    price: 149000,
    tagline: "Paket utama yang direkomendasikan.",
    maxEvents: 5,
    maxGuestsPerEvent: 300,
    premiumTemplates: true,
    whatsappBlast: true,
    qrCheckin: true,
    digitalGift: true,
    analytics: "Lengkap",
    support: "Prioritas",
    storage: "2 GB",
  },
  ULTIMATE: {
    key: "ULTIMATE",
    label: "Kurinji",
    price: 299000,
    tagline: "Untuk profesional, WO, maupun EO.",
    maxEvents: 999,
    maxGuestsPerEvent: 999999,
    premiumTemplates: true,
    whatsappBlast: true,
    qrCheckin: true,
    digitalGift: true,
    analytics: "Lengkap + Export",
    support: "Dedicated",
    storage: "10 GB",
  },
};

export const PLAN_ORDER: Plan[] = ["BASIC", "PREMIUM", "ULTIMATE"];

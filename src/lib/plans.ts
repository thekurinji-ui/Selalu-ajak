// BAB 18.3 & 18.4 — Paket Langganan & Perbandingan Paket
// Nilai harga dan batasan di sini adalah nilai awal (placeholder) yang bisa
// disesuaikan kapan saja tanpa mengubah struktur database, karena hanya
// dipakai sebagai konfigurasi aplikasi (bukan disimpan di DB).

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

export const PLANS: Record<Plan, PlanConfig> = {
  BASIC: {
    key: "BASIC",
    label: "Basic",
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
    label: "Premium",
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
    label: "Ultimate",
    price: 399000,
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

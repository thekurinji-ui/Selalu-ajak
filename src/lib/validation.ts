import { z } from "zod";

// BAB 7.4 — Register
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

// BAB 7.5 — Login
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// BAB 9.5 — Informasi Dasar Acara
export const eventSchema = z.object({
  name: z.string().min(3, "Nama acara minimal 3 karakter"),
  type: z.enum([
    "PERNIKAHAN", "LAMARAN", "TUNANGAN", "ULANG_TAHUN", "WISUDA", "AQIQAH",
    "TASYAKURAN", "SEMINAR", "WORKSHOP", "GATHERING", "CORPORATE_EVENT",
    "PELUNCURAN_PRODUK", "KONFERENSI", "REUNI", "KOMUNITAS", "LAINNYA",
  ]),
  date: z.coerce.date().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
});

// BAB 11.4 — Tambah Tamu
export const guestSchema = z.object({
  name: z.string().min(2, "Nama tamu minimal 2 karakter"),
  whatsapp: z.string().min(8, "Nomor WhatsApp tidak valid"),
  email: z.string().email().optional().or(z.literal("")),
  category: z.string().optional(),
  companions: z.coerce.number().int().min(0).default(0),
  note: z.string().optional(),
});

// BAB 12.4 — Form RSVP
export const rsvpSchema = z.object({
  status: z.enum(["AKAN_HADIR", "TIDAK_HADIR"]),
  companions: z.coerce.number().int().min(0).default(0),
  wishMessage: z.string().max(500).optional(),
});

// BAB Template Management — Admin/Content Manager kelola katalog template
export const templateSchema = z.object({
  name: z.string().min(3, "Nama template minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  description: z.string().optional(),
  eventType: z
    .enum([
      "PERNIKAHAN", "LAMARAN", "TUNANGAN", "ULANG_TAHUN", "WISUDA", "AQIQAH",
      "TASYAKURAN", "SEMINAR", "WORKSHOP", "GATHERING", "CORPORATE_EVENT",
      "PELUNCURAN_PRODUK", "KONFERENSI", "REUNI", "KOMUNITAS", "LAINNYA",
    ])
    .optional(),
  primaryColor: z.string().optional(),
  isPremium: z.coerce.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  defaultSections: z.string().min(2, "Struktur section wajib diisi"), // JSON string, di-parse di route
});

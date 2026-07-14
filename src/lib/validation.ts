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

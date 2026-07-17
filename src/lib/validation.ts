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
  // BAB Template Management — opsional, id InvitationTemplate yang dipilih
  // user saat membuat acara. String kosong dari <select> dianggap "tanpa
  // template" (mulai dari kanvas kosong seperti sebelumnya).
  templateId: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
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

// BAB 19.6 — Profil Pengguna
export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  whatsappNumber: z.string().optional(),
  city: z.string().optional(),
  language: z.enum(["id", "en"]).default("id"),
  timezone: z.string().default("Asia/Jakarta"),
});

// BAB 19.7 & 19.8 — Ganti Password (mengharuskan password lama demi keamanan)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak sama",
    path: ["confirmPassword"],
  });

// BAB 19.7 — Ganti Email
export const changeEmailSchema = z.object({
  newEmail: z.string().email("Email tidak valid"),
  currentPassword: z.string().min(1, "Password wajib diisi untuk konfirmasi"),
});

// BAB 19.5 — Lupa Password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tidak valid"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

// BAB 19.13 — Penghapusan Akun: user harus mengetik ulang kata "HAPUS" demi
// mencegah penghapusan tidak sengaja lewat 1 klik.
export const deleteAccountSchema = z.object({
  confirmation: z.literal("HAPUS", { errorMap: () => ({ message: "Ketik HAPUS untuk konfirmasi" }) }),
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

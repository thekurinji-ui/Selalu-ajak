# Selalu Ajak

> Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.

Platform manajemen acara digital — website undangan, guest management, RSVP,
WhatsApp Blast, QR Check-in, Digital Gift, dan Analytics dalam satu pengalaman
yang sederhana dan elegan. Bagian dari ekosistem **The Kurinji**, bersaudara
dengan [Kenang Kurinji](https://kurinji.asia) (dokumentasi & galeri kenangan
acara).

Domain produksi: `selaluajak.kurinji.asia`

**🚀 Live demo:** [selalu-ajak.vercel.app](https://selalu-ajak.vercel.app/) — sudah ter-deploy di Vercel, langsung bisa dicoba tanpa setup lokal.

---

## Status proyek

Ini adalah **scaffold fondasi (Phase 1 — Foundation)** hasil turunan dari
`Blueprint_selalu_ajak.pdf` (30 BAB, v2.0). Repo ini sudah bisa dijalankan
(`npm run dev`) dan mencakup:

- ✅ Landing page (BAB 6)
- ✅ Authentication — Register, Login (email/password + Google) (BAB 7)
- ✅ Dashboard Overview (BAB 8)
- ✅ Event Builder — buat & publish acara (BAB 9)
- ✅ Event Website publik `/i/{slug}` dengan personalisasi `?to=Nama` (BAB 10, 17)
- ✅ Guest Management (BAB 11)
- ✅ RSVP Management (BAB 12)
- ✅ WhatsApp Blast — model & kampanye siap, integrasi API sungguhan pending (BAB 13)
- ✅ QR Check-in — manual check-in **dan** pemindaian kamera (`html5-qrcode`) (BAB 14)
- ✅ Analytics dasar (BAB 15)
- ✅ Digital Gift (BAB 16)
- ✅ Subscription & Billing — alur Pilih Paket → Konfirmasi → Simulasi Pembayaran
  → Langganan Aktif; integrasi payment gateway sungguhan (Midtrans) pending (BAB 18)
- ✅ Admin Console — dashboard, User Management, Event Management (read-only),
  Subscription Management, Audit Log, role & permission (`ADMIN`, `SUPPORT`,
  `FINANCE`, `CONTENT_MANAGER`, `DEVELOPER`) (BAB 21)
- ✅ Audit Log dicatat otomatis untuk aksi-aksi administratif (BAB 22)

Belum termasuk (lihat roadmap BAB 29 di blueprint): integrasi WhatsApp Business
API & payment gateway sungguhan, Invitation Builder drag-and-drop penuh,
integrasi otomatis ke Kenang Kurinji, dan fitur AI.

## Tech stack

Stack ini sengaja disamakan dengan proyek saudaranya, **Kenang Kurinji**, agar
kedua produk mudah dirawat oleh tim yang sama dan siap diintegrasikan (BAB 4.10
— Product Ecosystem):

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + **PostgreSQL**
- **NextAuth v5** (Credentials + Google OAuth) dengan `@auth/prisma-adapter`
- **Tailwind CSS** dengan design token brand Selalu Ajak (BAB 2.10–2.11:
  Ivory White, Champagne Gold, Forest Green, tipografi Fraunces + Inter)
- **Zod** untuk validasi, **React Hook Form** siap dipakai di form berikutnya
- **lucide-react** untuk ikon

## Menjalankan secara lokal

> Untuk coba-coba, cukup buka [selalu-ajak.vercel.app](https://selalu-ajak.vercel.app/) — bagian ini hanya perlu kalau mau develop / kontribusi ke kode.

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment variables
cp .env.example .env
# isi DATABASE_URL, AUTH_SECRET (openssl rand -base64 32), dst.

# 3. Jalankan migrasi database
npx prisma migrate dev --name init

# 4. (Opsional) Isi data contoh — akun demo + satu acara
npm run prisma:seed

# 5. Jalankan development server
npm run dev
```

Buka `http://localhost:3000`. Jika menjalankan `prisma:seed`, login dengan
`demo@selaluajak.kurinji.asia` / `password123`.

Untuk masuk ke Admin Console (`/admin`), ubah `role` user di database menjadi
salah satu dari `ADMIN`, `SUPPORT`, `FINANCE`, `CONTENT_MANAGER`, atau
`DEVELOPER` (mis. lewat `npx prisma studio`) — akses penuh (ubah role user lain,
upgrade langganan manual) hanya untuk role `ADMIN`.

## Struktur folder

Mengikuti Information Architecture di BAB 5 blueprint:

```
src/
  app/
    (auth)/login, (auth)/register     # BAB 7
    dashboard/                        # BAB 8 — Overview, Events, Guests,
                                       #         RSVP, Check-in, WhatsApp,
                                       #         Gift, Billing, Analytics, Settings
    admin/                            # BAB 21 — Admin Console (dashboard,
                                       #          users, events, subscriptions,
                                       #          audit-log)
    i/[slug]/                         # BAB 17 — halaman undangan publik
    api/auth/, api/register/, api/checkin/scan/, api/guests/[id]/qrcode/
  components/
    landing/                          # Navbar, Hero (BAB 6)
    dashboard/                        # Sidebar, QrScanner (BAB 8.3, 14.5)
    admin/                            # AdminSidebar (BAB 21.2)
    ui/                               # Button, Input primitives
  lib/
    prisma.ts, auth.ts, admin.ts, plans.ts, subscription.ts,
    validation.ts, slug.ts, utils.ts
prisma/
  schema.prisma                       # BAB 24 — Database Design
  seed.ts                             # Data contoh untuk development
```

## Deployment

Repo ini sudah live di Vercel: **[selalu-ajak.vercel.app](https://selalu-ajak.vercel.app/)**.

Script `build` (`prisma generate && prisma db push --accept-data-loss && next build`)
sudah disiapkan supaya schema Prisma otomatis ter-sync ke database produksi
tiap kali deploy. Environment variables yang perlu diisi di project settings
Vercel sama seperti `.env.example`, minimal:

- `DATABASE_URL`, `DIRECT_URL` — koneksi PostgreSQL (mis. Neon, Supabase)
- `AUTH_SECRET`, `NEXTAUTH_URL` — wajib untuk NextAuth
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_DOMAIN`

Sisanya (`AUTH_GOOGLE_*`, `WHATSAPP_API_*`, `MIDTRANS_*`, `S3_*`) opsional,
mengaktifkan fitur yang bersangkutan kalau diisi.

## Skema database

Lihat `prisma/schema.prisma` — entity utama: `User`, `Event`, `InvitationPage`,
`Guest`, `Rsvp`, `CheckIn`, `WhatsappCampaign`, `DigitalGift`, `Subscription`,
`Invoice`, `Notification`, `AuditLog`, `AnalyticsEvent` — sesuai relasi di BAB
24.5.

## Langkah selanjutnya

1. Hubungkan penyedia WhatsApp Business API (`WHATSAPP_API_URL` /
   `WHATSAPP_API_TOKEN`) untuk mengaktifkan pengiriman WhatsApp Blast sungguhan.
2. Integrasikan payment gateway (Midtrans, `MIDTRANS_SERVER_KEY` /
   `MIDTRANS_CLIENT_KEY`) untuk menggantikan simulasi pembayaran di Subscription
   & Billing (BAB 18.6).
3. Bangun Invitation Builder drag-and-drop penuh di atas kolom `sections: Json`
   pada `InvitationPage` (BAB 10.3).
4. Tambahkan notifikasi in-app/email sungguhan di atas skema `Notification`
   (BAB 20).
5. Sambungkan ke Kenang Kurinji untuk galeri dokumentasi pasca-acara (BAB 4.10).

---

**The Kurinji** — 2026

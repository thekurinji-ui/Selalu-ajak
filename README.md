# Selalu Ajak

> Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.

Platform manajemen acara digital — website undangan, guest management, RSVP,
WhatsApp Blast, QR Check-in, Digital Gift, dan Analytics dalam satu pengalaman
yang sederhana dan elegan. Bagian dari ekosistem **The Kurinji**, bersaudara
dengan [Kenang Kurinji](https://kurinji.asia) (dokumentasi & galeri kenangan
acara).

Domain produksi: `selaluajak.kurinji.asia`

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
- ✅ WhatsApp Blast — model kampanye siap, integrasi API pending (BAB 13)
- ✅ QR Check-in — manual check-in, scan kamera menyusul (BAB 14)
- ✅ Analytics dasar (BAB 15)
- ✅ Digital Gift (BAB 16)
- ✅ Skema database lengkap untuk Subscription & Billing, Notification, Audit Log
  (BAB 18, 20, 22, 24) — UI-nya menyusul di Phase 2

Belum termasuk (lihat roadmap BAB 29 di blueprint): Admin Console (BAB 21),
integrasi WhatsApp Business API & payment gateway sungguhan, Invitation Builder
drag-and-drop penuh, integrasi otomatis ke Kenang Kurinji, dan fitur AI.

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

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment variables
cp .env.example .env
# isi DATABASE_URL, AUTH_SECRET (openssl rand -base64 32), dst.

# 3. Jalankan migrasi database
npx prisma migrate dev --name init

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:3000`.

## Struktur folder

Mengikuti Information Architecture di BAB 5 blueprint:

```
src/
  app/
    (auth)/login, (auth)/register     # BAB 7
    dashboard/                        # BAB 8 — Overview, Events, Guests,
                                       #         RSVP, Check-in, WhatsApp,
                                       #         Gift, Analytics, Settings
    i/[slug]/                         # BAB 17 — halaman undangan publik
    api/auth/, api/register/
  components/
    landing/                          # Navbar, Hero (BAB 6)
    dashboard/                        # Sidebar (BAB 8.3)
    ui/                               # Button, Input primitives
  lib/
    prisma.ts, auth.ts, validation.ts, slug.ts, utils.ts
prisma/
  schema.prisma                       # BAB 24 — Database Design
```

## Skema database

Lihat `prisma/schema.prisma` — entity utama: `User`, `Event`, `InvitationPage`,
`Guest`, `Rsvp`, `CheckIn`, `WhatsappCampaign`, `DigitalGift`, `Subscription`,
`Invoice`, `Notification`, `AuditLog`, `AnalyticsEvent` — sesuai relasi di BAB
24.5.

## Langkah selanjutnya

1. Hubungkan penyedia WhatsApp Business API (`WHATSAPP_API_URL` /
   `WHATSAPP_API_TOKEN`) untuk mengaktifkan pengiriman WhatsApp Blast sungguhan.
2. Tambahkan pemindaian kamera QR (mis. `html5-qrcode`) untuk Check-in (BAB 14.5).
3. Bangun Invitation Builder drag-and-drop penuh di atas kolom `sections: Json`
   pada `InvitationPage` (BAB 10.3).
4. Integrasikan payment gateway (Midtrans) untuk Subscription & Billing (BAB 18).
5. Bangun Admin Console (BAB 21) untuk tim internal.
6. Sambungkan ke Kenang Kurinji untuk galeri dokumentasi pasca-acara (BAB 4.10).

---

**The Kurinji** — 2026

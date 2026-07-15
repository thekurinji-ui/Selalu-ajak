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
- ✅ **Invitation Builder** — editor visual drag-and-drop penuh di atas kolom
  `InvitationPage.sections: Json`: tambah/hapus/pindah/duplikasi/sembunyikan
  section, 14 tipe section (Cover, Couple, Event Info, Countdown, Story,
  Timeline, Gallery, Video, Maps, RSVP, Digital Gift, Wishes, Footer, dst.),
  Live Preview dengan device switcher Desktop/Tablet/Mobile, dan Auto Save
  (BAB 10.3–10.9)
- ✅ Event Website publik `/i/{slug}` — render dinamis dari `sections`,
  dengan personalisasi `?to=Nama` (BAB 10, 17)
- ✅ Guest Management (BAB 11)
- ✅ RSVP Management (BAB 12)
- ✅ **WhatsApp Blast** — pengiriman sungguhan sudah tersambung ke
  [Fonnte](https://fonnte.com) (BAB 13): tombol "Kirim Sekarang" mengirim
  pesan personalisasi per-tamu (`{{nama_tamu}}`, `{{nama_acara}}`,
  `{{tanggal_acara}}`, `{{lokasi_acara}}`, `{{link_undangan}}`), status
  terkirim/gagal dilacak per-tamu di `WhatsappRecipient`, dan status
  delivered/read diperbarui real-time lewat webhook Fonnte
  (`POST /api/whatsapp/webhook`). Dibatasi paket langganan (`PLANS.*.whatsappBlast`)
- ✅ QR Check-in — manual check-in, scan kamera menyusul (BAB 14)
- ✅ Analytics dasar (BAB 15)
- ✅ Digital Gift (BAB 16) — pesan, rekening bank, e-wallet & QRIS tampil
  otomatis di section Digital Gift pada undangan
- ✅ Subscription & Billing — alur Pilih Paket → Invoice → Metode Pembayaran
  → Langganan Aktif (BAB 18.5), tersambung ke payment gateway Midtrans Snap
  (VA, QRIS, Kartu Kredit/Debit, E-Wallet — BAB 18.6), **live di Production**
  untuk `selaluajak.kurinji.asia`. Kalau `MIDTRANS_SERVER_KEY` belum diisi di
  environment tertentu (mis. saat development lokal), otomatis jatuh ke
  tombol simulasi supaya tetap bisa dites tanpa akun Midtrans
- ✅ **Admin Console** — dashboard ringkasan platform, kelola Users, Events,
  Subscriptions, dan Audit Log, dilindungi `requireAdmin()` guard (BAB 21)
- ✅ Skema database lengkap untuk Notification (BAB 20, 22) — UI-nya menyusul
  di Phase 2

Belum termasuk (lihat roadmap BAB 29 di blueprint): integrasi sungguhan
WhatsApp Business API (masih pakai Fonnte, gateway non-resmi), Theme System
visual (BAB 10.6 — saat ini satu tema default), integrasi otomatis ke Kenang
Kurinji, dan fitur AI.

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
src/
app/
(auth)/login, (auth)/register     # BAB 7
dashboard/                        # BAB 8 — Overview, Events, Guests,
#         RSVP, Check-in, WhatsApp,
#         Gift, Analytics, Settings
dashboard/events/[id]/builder/    # BAB 10 — Invitation Builder (editor)
i/[slug]/                         # BAB 17 — halaman undangan publik
api/auth/, api/register/
api/invitation/                   # GET/PUT sections — Auto Save (BAB 10.9)
components/
landing/                          # Navbar, Hero (BAB 6)
dashboard/                        # Sidebar (BAB 8.3)
builder/                          # Invitation Builder: LayersPanel,
#   AddSectionDrawer, SectionSettingsPanel,
#   PreviewCanvas, InvitationBuilder (BAB 10)
invitation/                       # SectionRenderer — dipakai bersama oleh
#   builder (preview) & halaman publik
ui/                               # Button, Input primitives
lib/
prisma.ts, auth.ts, validation.ts, slug.ts, utils.ts
invitation-sections.ts            # Skema & Section Library (BAB 10.4–10.5)
prisma/
schema.prisma                       # BAB 24 — Database Design

## Skema database

Lihat `prisma/schema.prisma` — entity utama: `User`, `Event`, `InvitationPage`,
`Guest`, `Rsvp`, `CheckIn`, `WhatsappCampaign`, `DigitalGift`, `Subscription`,
`Invoice`, `Notification`, `AuditLog`, `AnalyticsEvent` — sesuai relasi di BAB
24.5.

## Invitation Builder (BAB 10)

Editor visual drag-and-drop untuk menyusun website undangan, dibangun di atas
kolom `InvitationPage.sections: Json`. Diakses lewat
`/dashboard/events/{id}/builder`.

- **Block-Based** (10.3) — setiap bagian undangan adalah "Section" yang bisa
  ditambah, dihapus, dipindah (drag-and-drop), diduplikasi, dan disembunyikan.
- **Section Library** (10.5) — 14 tipe section bawaan: Opening Cover, Opening
  Message, Couple/Host, Event Information, Countdown, Story, Timeline,
  Gallery, Video, Location & Maps, RSVP, Digital Gift, Wishes, Footer.
  Didefinisikan di `src/lib/invitation-sections.ts`.
- **Live Preview** (10.8) — perubahan langsung tercermin di kanvas tengah,
  dengan switch tampilan Desktop / Tablet / Mobile.
- **Auto Save** (10.9) — setiap perubahan sections di-debounce lalu disimpan
  otomatis lewat `PUT /api/invitation`, dengan indikator "Menyimpan..." /
  "Perubahan tersimpan.".
- Halaman publik `/i/{slug}` merender section yang sama persis (komponen
  `SectionRenderer` dipakai bersama oleh builder & halaman publik), jadi Live
  Preview selalu identik dengan hasil akhir.

Belum tercakup dari BAB 10: Theme System visual (10.6 — ganti tema/warna/font
sekaligus), Custom CSS, Marketplace template, AI Copy/Theme Assistant, dan
Version History (10.15, roadmap Future Development).

## Langkah selanjutnya

1. Isi `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `APP_URL`, dan
   `MIDTRANS_IS_PRODUCTION` untuk mengaktifkan pembayaran Midtrans Snap
   sungguhan di Subscription & Billing (BAB 18.6) — lihat `src/lib/midtrans.ts`,
   `/api/billing/checkout`, dan `/api/billing/webhook`.

   > **Sandbox vs Production**: `MIDTRANS_IS_PRODUCTION` wajib disamakan
   > dengan jenis key yang diisi — `"true"` kalau `MIDTRANS_SERVER_KEY` &
   > `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` adalah Production key (tanpa prefix
   > `SB-`), atau `"false"`/kosong kalau masih Sandbox key (prefix
   > `SB-Mid-server-...` / `SB-Mid-client-...`). Kalau kedua hal ini tidak
   > cocok (mis. Production key tapi flag masih `false`), request akan
   > diarahkan ke endpoint Midtrans yang salah dan transaksi akan ditolak.
   > Payment Notification URL di Midtrans Dashboard juga perlu didaftarkan di
   > mode yang sesuai (Sandbox atau Production) — kedua mode punya setting
   > terpisah, tidak otomatis ikut satu sama lain.

   > **Catatan multi-web Kurinji**: kalau 1 akun Midtrans ini dipakai bareng
   > oleh web Kurinji lain (mis. `kenang.kurinji.asia`, `music.kurinji.asia`),
   > `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, dan
   > `MIDTRANS_IS_PRODUCTION` boleh sama di semua web, tapi `APP_URL`
   > **wajib beda-beda per web** — isi dengan domain web itu sendiri (mis.
   > `https://selaluajak.kurinji.asia` di project ini). Nilai ini dipakai
   > untuk mengirim header `X-Override-Notification` ke Midtrans supaya
   > notifikasi pembayaran selalu balik ke webhook web yang benar-benar
   > membuat transaksinya, bukan ke Notification URL default di dashboard.
2. Bangun Theme System visual (BAB 10.6–10.7) — ganti warna, font, dan
   background tema langsung dari Invitation Builder.
3. Sambungkan ke Kenang Kurinji untuk galeri dokumentasi pasca-acara (BAB 4.10).
4. Untuk WhatsApp Blast dalam skala besar (ratusan/ribuan tamu sekaligus),
   pindahkan proses kirim di `POST /api/whatsapp/campaigns/[id]/send` dari
   loop sinkron ke queue/background job — saat ini dibatasi durasi function
   Vercel (`maxDuration = 60`).

---

**The Kurinji** — 2026

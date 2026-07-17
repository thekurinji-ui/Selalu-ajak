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

- ✅ Landing page (BAB 6) — Hero, section Fitur (`#fitur`), galeri Template
  (`#template`, otomatis nampilin template `PUBLISHED` dari katalog admin —
  section ini sembunyi sendiri kalau belum ada template yang dipublish), dan
  perbandingan Harga (`#harga`, tabel fitur lengkap dari `PLAN_FEATURES`)
- ✅ Authentication — Register, Login (email/password + Google) (BAB 7)
- ✅ **Account & User Management** (BAB 19) — halaman `/dashboard/settings`
  sekarang beneran fungsional (sebelumnya stub baca-saja): edit profil
  (nama, WhatsApp, kota, bahasa, zona waktu), ganti password, ganti email
  (keduanya butuh konfirmasi password saat ini), **Lupa Password** (kirim
  link reset lewat email, `PasswordResetToken` yang sebelumnya nganggur di
  schema sekarang dipakai), dan Hapus Akun permanen (konfirmasi ketik
  "HAPUS", data ikut terhapus lewat cascade). Aktivitas penting (ganti
  password/email, hapus akun) tercatat di `AuditLog`. Kirim email pakai
  Resend lewat `src/lib/email.ts` — kalau `RESEND_API_KEY` belum diisi,
  fitur lupa password tetap bisa dites (link reset tampil langsung di
  halaman, mode development, pola sama seperti `isMidtransConfigured()`)
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
- ✅ **Theme System** — ganti warna, kombinasi font, dan background tema
  langsung dari Invitation Builder lewat `ThemeDrawer`, tanpa mengubah
  struktur section (BAB 10.6–10.7). Preset tema didefinisikan di
  `src/lib/invitation-themes.ts`, diterapkan lewat CSS variable oleh
  `ThemeProvider` — dipakai bersama oleh Live Preview & halaman publik
  `/i/{slug}` supaya hasilnya selalu identik
- ✅ Guest Management (BAB 11)
- ✅ RSVP Management (BAB 12)
- ✅ **WhatsApp Blast** — pengiriman sungguhan sudah tersambung ke
  [Fonnte](https://fonnte.com) (BAB 13): tombol "Kirim Sekarang" mengirim
  pesan personalisasi per-tamu (`{{nama_tamu}}`, `{{nama_acara}}`,
  `{{tanggal_acara}}`, `{{lokasi_acara}}`, `{{link_undangan}}`), status
  terkirim/gagal dilacak per-tamu di `WhatsappRecipient`, dan status
  delivered/read diperbarui real-time lewat webhook Fonnte
  (`POST /api/whatsapp/webhook`). Dibatasi kuota per paket
  (`PLANS.*.whatsappMessageLimit` — 100/500/2.000 penerima per kampanye,
  dicek di server sebelum kirim). Selain jalur otomatis Fonnte, ada juga
  **Kirim Manual via WA Pribadi** — tombol per-tamu yang membuka WhatsApp
  pengguna sendiri dengan pesan sudah terisi (link `wa.me`), buat client yang
  mau kirim dari nomor pribadinya sendiri, bukan dari device Fonnte
  TheKurinji, dan tidak kena batas kuota kampanye
- ✅ QR Check-in — QR unik per tamu (`Guest.qrCode`, digenerate jadi gambar PNG
  lewat `/api/guests/[id]/qrcode`), scan kamera langsung dari
  `/dashboard/checkin` (`QrScanner`, pakai `html5-qrcode`, idempotent —
  scan ulang tamu yang sudah check-in tidak dianggap error), plus manual
  check-in dari daftar tamu sebagai fallback (BAB 14)
- ✅ Analytics dasar (BAB 15)
- ✅ Digital Gift (BAB 16) — pesan, rekening bank, e-wallet & QRIS tampil
  otomatis di section Digital Gift pada undangan
- ✅ Subscription & Billing — 3 paket bertema Kurinji: **Kuncup** (gratis),
  **Mekar** (Rp149.000), **Kurinji** (Rp299.000). Alur Pilih Paket → Invoice
  → Metode Pembayaran → Langganan Aktif (BAB 18.5), tersambung ke payment
  gateway Midtrans Snap (VA, QRIS, Kartu Kredit/Debit, E-Wallet — BAB 18.6),
  **live di Production** untuk `selaluajak.kurinji.asia`. Kalau
  `MIDTRANS_SERVER_KEY` belum diisi di environment tertentu (mis. saat
  development lokal), otomatis jatuh ke tombol simulasi supaya tetap bisa
  dites tanpa akun Midtrans. Detail lengkap tiap paket ada di section
  "Paket Langganan" di bawah
- ✅ **Admin Console** — dashboard ringkasan platform, kelola Users, Events,
  Template Undangan, Subscriptions, dan Audit Log, dilindungi `requireAdmin()`
  guard (BAB 21)
- ✅ **Template Marketplace** — Admin/Content Manager kelola katalog template
  (`InvitationTemplate`: upload thumbnail, preview images, default sections,
  status Draft/Published/Archived, tandai Premium) lewat `/admin/templates`.
  Template berstatus Published tampil sebagai pilihan visual saat user
  membuat acara baru (`/dashboard/events`) — `InvitationTemplate.
  defaultSections` & `primaryColor` jadi titik awal Invitation Builder, dan
  `usageCount` bertambah tiap kali dipakai
- ✅ Skema database lengkap untuk Notification (BAB 20, 22) — UI-nya menyusul
  di Phase 2

Belum termasuk (lihat roadmap BAB 29 di blueprint): integrasi sungguhan
WhatsApp Business API (masih pakai Fonnte, gateway non-resmi), gating
template Premium ke paket langganan tertentu, integrasi otomatis ke Kenang
Kurinji, dan fitur AI. Selain itu, beberapa hal yang disebut di sitemap
blueprint (BAB 5.3) tapi belum ada kodenya sama sekali: halaman publik
`/about`, `/faq`, `/contact` sebagai halaman berdiri sendiri (FAQ saat ini
baru section accordion di landing page, bukan halaman terpisah), CMS/artikel
individual untuk Blog (baru ada listing statis di `/blog`), fitur Kupon &
Promo (BAB 18.11), serta modul Admin Console untuk Support Center/tiket,
System Monitoring, dan Reports (BAB 21.7, 21.9–21.10) — Admin Console saat
ini baru mencakup Users, Events, Template, Subscriptions, dan Audit Log.

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

## Deploy & migrasi database (Vercel + Neon)

Build command di `package.json` menjalankan `prisma migrate deploy`, **bukan**
`prisma db push`. Bedanya penting: `migrate deploy` hanya menerapkan file
migration yang sudah di-commit ke folder `prisma/migrations/`, secara
terurut dan tanpa pernah menghapus data di luar yang memang diminta migration
tersebut. Ini yang dipakai di Production (`selaluajak.kurinji.asia`, database
Neon) supaya perubahan schema selalu tercatat jejaknya dan tidak ada
kejutan data hilang saat deploy.

**Setiap kali `prisma/schema.prisma` diubah**, alurnya:

```bash
# 1. Di lokal, pastikan .env mengarah ke database development (bukan Neon
#    production), lalu buat migration baru dari perubahan schema
npx prisma migrate dev --name deskripsi_singkat_perubahan

# 2. Commit folder migration yang baru muncul
git add prisma/migrations
git commit -m "chore: migration - deskripsi_singkat_perubahan"
git push
```

Begitu di-push, Vercel otomatis menjalankan `prisma migrate deploy` sebagai
bagian dari build, menerapkan migration baru itu ke Neon secara aman.

> **Catatan `DATABASE_URL` vs `DIRECT_URL`**: di environment variables Vercel,
> `DATABASE_URL` sebaiknya connection string Neon yang **pooled** (hostname
> mengandung `-pooler`, lewat PgBouncer — dipakai runtime app), sedangkan
> `DIRECT_URL` connection string **non-pooled** (dipakai Prisma khusus saat
> menjalankan migration, karena DDL butuh koneksi langsung).

> **Migration baseline**: repo ini sebelumnya sempat memakai
> `prisma db push --accept-data-loss` sebelum pindah ke `migrate deploy`.
> Kalau suatu saat clone ulang dari database Neon yang sudah berisi data
> tanpa histori migration, baseline dulu dengan
> `npx prisma migrate dev --name init --create-only` lalu
> `npx prisma migrate resolve --applied "<nama_migration>"` sebelum push —
> supaya Prisma tahu schema saat ini sudah sesuai tanpa mencoba
> membuat ulang tabel yang sudah ada.

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
`InvitationTemplate`, `Guest`, `Rsvp`, `CheckIn`, `WhatsappCampaign`,
`DigitalGift`, `Subscription`, `Invoice`, `Notification`, `AuditLog`,
`AnalyticsEvent` — sesuai relasi di BAB 24.5.

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
- **Theme System** (10.6–10.7) — `ThemeDrawer` menampilkan preset tema (warna
  + pasangan font) yang bisa dipilih atau dikustomisasi per-warna, disimpan
  di field tema pada `Event` dan ikut Auto Save. `ThemeProvider` menyuntikkan
  variabel CSS `--sa-*` yang dipakai token Tailwind `theme-*`, jadi seluruh
  section otomatis ikut berubah tanpa logika tambahan per-komponen.

Ada juga `HeritageOriginalTheme` (`src/components/invitation-themes/`) —
tema custom-designed yang bisa dilihat previewnya di `/tema/heritage-original`,
tapi **masih statis** (pakai data contoh, belum dipetakan dari
`InvitationPage.sections` atau data `Event`/`Guest` asli).

Belum tercakup dari BAB 10: Custom CSS, gating template Premium ke paket
langganan tertentu, AI Copy/Theme Assistant, dan Version History (10.15,
roadmap Future Development).

## Paket Langganan

Nama & harga paket didefinisikan di `PLANS` (`src/lib/plans.ts`), nama tema
Kurinji: **Kuncup** (Gratis) → **Mekar** (Rp149.000) → **Kurinji**
(Rp299.000). `key` internal-nya tetap pakai enum Prisma lama
(`BASIC`/`PREMIUM`/`ULTIMATE`) supaya tidak perlu migration — yang berubah
cuma `label` yang tampil ke user.

Perbandingan fitur lengkap (20 baris) ada di `PLAN_FEATURES`, satu sumber
data yang dipakai bareng oleh landing page (`/#harga`) dan halaman
`/dashboard/billing`, supaya keduanya nggak pernah beda-beda kalau direvisi.

**Yang beneran di-enforce oleh kode** (bukan cuma tampilan):
- `maxEvents` — jumlah acara aktif, dicek di `getEventUsage()`
  (`src/lib/subscription.ts`), dipakai saat `createEvent`.
- `whatsappMessageLimit` — maks. penerima per kampanye WhatsApp Blast (100 /
  500 / 2.000), dicek di `POST /api/whatsapp/campaigns/[id]/send` sebelum
  kirim, dan ditampilkan di `/dashboard/whatsapp`.

**Baru sebatas tampilan di tabel fitur**, belum ada logika pembatas di kode:
Template (jumlah/kategori), Guest Management (limit tamu), QR Check-in
(`qrCheckin` masih terbuka untuk semua paket), Digital Gift (jumlah rekening
— skema `bankAccounts` di `DigitalGift` sudah berupa array/JSON dan bisa
menampung banyak akun, tapi form `saveDigitalGift` di
`/dashboard/gift/page.tsx` saat ini cuma menangani 1 rekening), Analytics,
Integrasi Kenang Kurinji, Live Streaming, Galeri Foto, Video, Musik,
Watermark, Subdomain Eksklusif, dan Prioritas Support. Kalau salah satu ini
mau benar-benar dibatasi per paket, perlu ditambahkan pengecekannya di modul
masing-masing (pola yang sama seperti `whatsappMessageLimit` di atas).



Pembayaran sungguhan (VA, QRIS, Kartu Kredit/Debit, E-Wallet — BAB 18.6)
**sudah aktif di Production** untuk `selaluajak.kurinji.asia`. Tombol "Bayar
Sekarang" di `/dashboard/billing` (`PayInvoiceButton`) otomatis muncul begitu
`MIDTRANS_SERVER_KEY` terisi di environment; kalau belum diisi (mis.
development lokal), halaman jatuh ke tombol "Simulasikan Pembayaran
Berhasil" supaya alur tetap bisa dites tanpa akun Midtrans.

Env yang dipakai — isi semuanya di Vercel Project Settings → Environment
Variables (lihat `src/lib/midtrans.ts` untuk detail implementasi):

- `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — dari Midtrans
  Dashboard → Settings → Access Keys.
- `MIDTRANS_IS_PRODUCTION` — **wajib disamakan** dengan jenis key yang
  diisi: `"true"` kalau key Production (tanpa prefix `SB-`), atau
  `"false"`/kosong kalau masih key Sandbox (prefix `SB-Mid-server-...` /
  `SB-Mid-client-...`). Kalau tidak cocok, request diarahkan ke endpoint
  Midtrans yang salah dan transaksi ditolak.
- `APP_URL` — base URL domain **Selalu Ajak sendiri**
  (`https://selaluajak.kurinji.asia`), dipakai untuk mengirim header
  `X-Override-Notification` ke Midtrans.

> **Catatan multi-web Kurinji**: akun Midtrans ini dipakai bareng oleh web
> Kurinji lain, dan Payment Notification URL default di Midtrans Dashboard
> saat ini terdaftar milik **Kenang Kurinji**, bukan Selalu Ajak — ini
> aman selama `APP_URL` di atas terisi benar. Header
> `X-Override-Notification` yang dikirim tiap kali membuat transaksi baru
> memaksa Midtrans mengirim notifikasi pembayaran ke webhook
> `{APP_URL}/api/billing/webhook` milik Selalu Ajak, terlepas dari
> Notification URL default di Dashboard. Kalau `APP_URL` sampai kosong,
> override ini tidak terkirim dan invoice Selalu Ajak **tidak akan pernah**
> otomatis berubah jadi PAID walau user sudah bayar — gagalnya senyap,
> tanpa error yang terlihat.
> Sandbox dan Production juga punya setting Notification URL terpisah di
> Dashboard Midtrans, tidak otomatis ikut satu sama lain.

Setelah env terisi, tes alur end-to-end sekali: upgrade paket → bayar
(pakai [kartu test Sandbox](https://docs.midtrans.com/docs/testing-payment-on-sandbox)
kalau masih pakai key Sandbox) → pastikan invoice di `/dashboard/billing`
otomatis berubah **PAID** dan status langganan jadi **Aktif**, bukan cuma
popup Snap-nya yang berhasil.

## Langkah selanjutnya

1. **Setup Resend** untuk fitur Lupa Password beneran ngirim email: daftar
   di [resend.com](https://resend.com), verifikasi domain
   `selaluajak.kurinji.asia` (atau subdomain email khusus), lalu isi
   `RESEND_API_KEY` di Vercel. Tanpa ini, fitur lupa password tetap jalan
   tapi cuma dalam mode development (link reset tampil di halaman, bukan
   email sungguhan) — jangan sampai lupa isi sebelum ada user asli yang
   butuh reset password.
2. Sisa BAB 19 yang belum dikerjakan: **manajemen sesi/perangkat** (19.9 —
   daftar perangkat yang login + tombol akhiri sesi tertentu) belum ada,
   karena NextAuth di project ini pakai `strategy: "jwt"` (token stateless
   tanpa tabel Session di database), jadi butuh mekanisme tambahan (versi
   token per-user, dicek ulang tiap request) kalau mau dibangun. **2FA**,
   **Kolaborasi Tim** (multi-role per acara), dan **Login OTP WhatsApp**
   masih ditandai "pengembangan berikutnya" di blueprint sendiri (19.16),
   jadi belum jadi prioritas.
3. Gating **template Premium**: saat ini badge "Premium" di pemilihan template
   (`/dashboard/events`) baru bersifat visual — belum ada pengecekan paket
   langganan (`PLANS.*`) yang memblokir user paket gratis memilih template
   Premium. Tambahkan pengecekan itu di `createEvent`
   (`src/app/dashboard/events/page.tsx`), mirip pola `getEventUsage`.
4. Bangun enforcement untuk baris `PLAN_FEATURES` yang masih sebatas
   tampilan (lihat daftarnya di section "Paket Langganan" di atas) — paling
   mendesak: form Digital Gift (`/dashboard/gift/page.tsx`) baru menangani 1
   rekening, padahal skema `bankAccounts` (JSON array) sudah siap menampung
   banyak akun sesuai kuota tiap paket.
5. **WhatsApp Blast dari nomor pribadi client, otomatis (bukan manual)**:
   `Kirim Manual via WA Pribadi` (link `wa.me`) sudah tersedia sebagai jalan
   cepat, tapi masih satu-satu per tamu. Kalau ke depan butuh yang otomatis
   dari nomor pribadi tiap client, ada 2 opsi: (a) tiap client bikin device
   Fonnte sendiri (scan QR dengan WA pribadi, simpan token device per-user)
   — tetap gateway non-resmi, ada risiko nomor client kena ban WhatsApp kalau
   volumenya besar; atau (b) integrasi resmi Meta WhatsApp Cloud API per
   client (perlu verifikasi bisnis & approval template dari Meta, biaya per
   pesan ditagih langsung ke client) — jauh lebih besar scope-nya, proyek
   tersendiri.
6. Sambungkan ke Kenang Kurinji untuk galeri dokumentasi pasca-acara (BAB 4.10).
7. Untuk WhatsApp Blast dalam skala besar (ratusan/ribuan tamu sekaligus),
   pindahkan proses kirim di `POST /api/whatsapp/campaigns/[id]/send` dari
   loop sinkron ke queue/background job — saat ini dibatasi durasi function
   Vercel (`maxDuration = 60`).
8. **Bangun UI Notification Center (BAB 20)** — model `Notification` sudah
   ada di schema dan dipakai untuk kirim notifikasi dari beberapa modul,
   tapi belum ada inbox/ikon lonceng/badge di Dashboard untuk
   menampilkannya ke user.
9. **Halaman publik yang belum ada** (disebut di sitemap BAB 5.3 tapi belum
   ada file-nya): `/about`, `/faq`, `/contact` sebagai halaman mandiri, dan
   CMS/halaman artikel individual untuk Blog (`/blog/[slug]`) — saat ini
   `/blog` baru listing statis tanpa admin content management.
10. **Kupon & Promo (BAB 18.11)** dan modul Admin **Support Center, System
    Monitoring, Reports** (BAB 21.7, 21.9–21.10) — belum ada implementasi
    sama sekali, baik schema maupun UI.

---

**The Kurinji** — 2026

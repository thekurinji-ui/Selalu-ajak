import Link from "next/link";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { KenangKurinjiSection } from "@/components/landing/KenangKurinjiSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { BlogPreview } from "@/components/landing/BlogPreview";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";
import { PLANS, PLAN_ORDER, PLAN_FEATURES } from "@/lib/plans";
import { formatRupiah, cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

// BAB 6.3.5 — Feature Highlights
const features = [
  { title: "Website Undangan", desc: "Editor drag-and-drop tanpa kode, tema elegan siap pakai." },
  { title: "Guest Management", desc: "Kelola seluruh data tamu terpusat dengan kategori & tag." },
  { title: "RSVP Otomatis", desc: "Konfirmasi kehadiran real-time, terhubung ke seluruh modul." },
  { title: "WhatsApp Blast", desc: "Kirim undangan massal dengan personalisasi nama tamu." },
  { title: "QR Check-in", desc: "Registrasi tamu cepat menggunakan kamera perangkat apa pun." },
  { title: "Digital Gift", desc: "Terima hadiah digital melalui rekening, QRIS, atau e-wallet." },
  { title: "Analytics", desc: "Pantau performa undangan & kehadiran tamu secara real-time." },
  { title: "Integrasi Kenang Kurinji", desc: "Dokumentasi acara tetap hidup setelah hari-H berakhir." },
];

// BAB 6.6 — SEO Strategy: Structured Data (schema.org Organization + FAQPage)
function StructuredData() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Selalu Ajak",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://selaluajak.kurinji.asia",
    description:
      "Platform manajemen acara digital yang membantu Anda membuat undangan, mengelola tamu, menerima RSVP, hingga mengabadikan kenangan dalam satu pengalaman yang elegan.",
    sameAs: [
      "https://instagram.com/selaluajak",
      "https://facebook.com/selaluajak",
      "https://youtube.com/@selaluajak",
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Apakah bisa gratis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bisa. Paket Basic memungkinkan Anda membuat satu acara secara gratis dengan fitur inti seperti undangan, guest management, dan RSVP.",
        },
      },
      {
        "@type": "Question",
        name: "Bagaimana cara RSVP?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tamu cukup membuka link undangan yang dikirim lewat WhatsApp, lalu mengisi form RSVP langsung dari halaman tersebut.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah bisa custom domain?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bisa, tersedia untuk paket Premium dan Ultimate.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah bisa digunakan selain pernikahan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Tentu. Selain pernikahan, Selalu Ajak mendukung ulang tahun, lamaran, wisuda, seminar, gathering, hingga acara korporat.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

export default async function LandingPage() {
  // Section "Template" di bawah cuma tampil kalau ada template yang sudah
  // dipublish oleh Admin/Content Manager di /admin/templates — supaya
  // landing page tidak menampilkan kotak kosong sebelum ada template.
  const [templates, eventCount, guestCount, rsvpCount] = await Promise.all([
    prisma.invitationTemplate.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 9,
    }),
    prisma.event.count(),
    prisma.guest.count(),
    prisma.rsvp.count({ where: { status: "AKAN_HADIR" } }),
  ]);

  return (
    <main>
      <StructuredData />
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <TrustedBy eventCount={eventCount} guestCount={guestCount} rsvpCount={rsvpCount} />

      <section id="fitur" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
          Semua yang Anda butuhkan, dalam satu platform
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-champagne-100 bg-white p-6 shadow-soft"
            >
              <h3 className="font-heading text-lg font-medium text-forest-700">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <HowItWorks />

      {templates.length > 0 && (
        <TemplateShowcase
          templates={templates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            thumbnailUrl: t.thumbnailUrl,
            isPremium: t.isPremium,
            eventType: t.eventType,
          }))}
        />
      )}

      <DashboardPreview />
      <KenangKurinjiSection />

      <section id="harga" className="bg-champagne-50/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
            Pilih paket yang sesuai kebutuhan Anda
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            Mulai gratis, upgrade kapan saja. Tanpa kontrak, tanpa biaya
            tersembunyi.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const p = PLANS[key];
              const isHighlighted = key === "PREMIUM";
              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col rounded-lg border bg-white p-6 shadow-soft",
                    isHighlighted
                      ? "border-forest-500 ring-1 ring-forest-500"
                      : "border-champagne-100",
                  )}
                >
                  {isHighlighted && (
                    <span className="mb-3 inline-block w-fit rounded-full bg-forest-600 px-3 py-1 text-xs font-medium text-white">
                      Paling Direkomendasikan
                    </span>
                  )}
                  <p className="font-heading text-xl font-semibold text-forest-700">{p.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>
                  <p className="mt-4 font-heading text-3xl font-semibold text-forest-700">
                    {formatRupiah(p.price)}
                    {p.price > 0 && <span className="text-sm font-normal text-slate-500">/bulan</span>}
                  </p>

                  <ul className="mt-6 space-y-1.5 text-sm text-slate-600">
                    <li>• {p.maxEvents === 999 ? "Acara aktif tanpa batas" : `${p.maxEvents} acara aktif`}</li>
                    {PLAN_FEATURES.slice(0, 5).map((row) => (
                      <li key={row.label}>
                        •{" "}
                        {typeof row.values[key] === "boolean"
                          ? row.label
                          : `${row.label}: ${row.values[key]}`}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={cn(
                      "mt-8 block rounded-md px-4 py-2 text-center text-sm font-medium transition",
                      isHighlighted
                        ? "bg-forest-600 text-white hover:bg-forest-700"
                        : "border border-forest-500 text-forest-700 hover:bg-forest-50",
                    )}
                  >
                    {p.price === 0 ? "Mulai Gratis" : "Pilih Paket"}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Tabel perbandingan lengkap — sumber datanya sama persis dengan
              kartu di atas & halaman Billing (PLAN_FEATURES di lib/plans.ts). */}
          <div className="mt-14 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-champagne-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Fitur</th>
                  {PLAN_ORDER.map((key) => (
                    <th key={key} className="px-4 py-3 text-center font-heading font-semibold text-forest-700">
                      {PLANS[key].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-champagne-50">
                  <td className="px-4 py-3 font-medium text-slate-700">Harga</td>
                  {PLAN_ORDER.map((key) => (
                    <td key={key} className="px-4 py-3 text-center text-slate-600">
                      {formatRupiah(PLANS[key].price)}
                    </td>
                  ))}
                </tr>
                {PLAN_FEATURES.map((row) => (
                  <tr key={row.label} className="border-b border-champagne-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                    {PLAN_ORDER.map((key) => (
                      <td key={key} className="px-4 py-3 text-center text-slate-600">
                        {typeof row.values[key] === "boolean" ? (row.values[key] ? "✅" : "❌") : row.values[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Testimonials />
      <FaqAccordion />
      <BlogPreview />
      <CtaSection />
      <Footer />
    </main>
  );
                      }

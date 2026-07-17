import Link from "next/link";
import { ArrowRight } from "lucide-react";

// BAB 6.3.13 — Blog Preview. Menampilkan artikel terbaru untuk mendukung
// SEO (BAB 6.6). Sistem blog (CMS artikel) sendiri belum dibangun — section
// ini memakai data contoh dan mengarah ke /blog. Saat model Article sudah
// tersedia di database, ganti array `posts` dengan hasil query prisma.
const posts = [
  { category: "Tips Acara", title: "5 Hal yang Wajib Dicek Sebelum Kirim Undangan Digital", slug: "cek-sebelum-kirim-undangan" },
  { category: "Pernikahan", title: "Panduan Menyusun Guest List agar RSVP Lebih Rapi", slug: "panduan-guest-list-rapi" },
  { category: "Teknologi", title: "Kenapa QR Check-in Lebih Efisien untuk Acara Besar", slug: "qr-checkin-efisien" },
];

export function BlogPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest-700">
            Inspirasi & tips terbaru
          </h2>
          <p className="mt-2 text-slate-600">
            Bacaan seputar acara, undangan digital, dan dokumentasi momen.
          </p>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:text-forest-600"
        >
          Lihat semua artikel <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-lg border border-champagne-100 bg-white p-6 shadow-soft transition hover:shadow-medium"
          >
            <span className="w-fit rounded-full bg-champagne-50 px-3 py-1 text-xs font-medium text-champagne-700">
              {post.category}
            </span>
            <h3 className="mt-4 font-heading text-lg font-medium text-forest-700 group-hover:text-forest-600">
              {post.title}
            </h3>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-slate-500">
              Baca selengkapnya <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

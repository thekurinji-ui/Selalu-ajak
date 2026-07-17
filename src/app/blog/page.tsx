import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

// Halaman placeholder untuk link "/blog" yang dipakai Navbar, Footer, dan
// BlogPreview (BAB 6.3.13). Sistem CMS artikel penuh belum masuk cakupan
// BAB 6 (Landing Website) — halaman ini menjaga link tetap hidup dan
// menjelaskan bahwa konten sedang disiapkan, alih-alih 404.
export const metadata: Metadata = {
  title: "Blog — Selalu Ajak",
  description:
    "Inspirasi, tips acara, dan dokumentasi seputar undangan digital dari Selalu Ajak. Segera hadir.",
};

export default function BlogIndexPage() {
  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-champagne-600">Blog</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-forest-700 md:text-4xl">
          Artikel & inspirasi sedang kami siapkan
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600">
          Kami sedang menyiapkan artikel seputar tips acara, undangan digital,
          dan dokumentasi momen. Sementara itu, yuk mulai buat acara Anda
          lebih dulu.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-block rounded-md bg-forest-600 px-8 py-3 text-base font-medium text-white shadow-medium transition hover:bg-forest-700"
        >
          Buat Acara Gratis
        </Link>
      </section>
      <Footer />
    </main>
  );
}

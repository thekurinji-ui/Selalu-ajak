import Link from "next/link";

// BAB 6.3.14 — Call To Action. Section terakhir sebelum footer.
export function CtaSection() {
  return (
    <section className="bg-forest-700 py-20 text-center text-ivory">
      <h2 className="font-heading text-3xl font-semibold">Siap Memulai Cerita Anda?</h2>
      <p className="mx-auto mt-4 max-w-xl text-champagne-100">
        Buat acara pertama Anda hari ini dan rasakan pengalaman mengelola acara
        dengan lebih sederhana.
      </p>
      <Link
        href="/register"
        className="mt-8 inline-block rounded-md bg-champagne-500 px-8 py-3 font-medium text-forest-900 shadow-medium transition hover:bg-champagne-400"
      >
        Buat Acara Gratis
      </Link>
    </section>
  );
}

import Link from "next/link";

// BAB 6.3.3 — Hero Section. Menambahkan visual mockup (desktop + smartphone)
// di bawah CTA sesuai blueprint: "Visual utama berupa mockup website
// undangan pada desktop dan smartphone." Dibangun murni pakai CSS/markup
// (tanpa aset gambar) supaya tetap ringan & tidak bergantung file statis.
export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
      <p className="mb-4 text-sm font-medium uppercase tracking-wide text-champagne-600">
        Bagian dari ekosistem The Kurinji
      </p>
      <h1 className="mx-auto max-w-3xl font-heading text-4xl font-semibold leading-tight text-forest-700 md:text-6xl">
        Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
        Platform manajemen acara digital yang membantu Anda membuat undangan,
        mengelola tamu, menerima RSVP, hingga mengabadikan kenangan dalam satu
        pengalaman yang elegan.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/register"
          className="rounded-md bg-forest-600 px-8 py-3 text-base font-medium text-white shadow-medium transition hover:bg-forest-700"
        >
          Buat Acara Gratis
        </Link>
        <Link
          href="/#template"
          className="rounded-md border border-champagne-400 px-8 py-3 text-base font-medium text-forest-700 transition hover:bg-champagne-50"
        >
          Lihat Demo
        </Link>
      </div>

      {/* Mockup desktop + smartphone */}
      <div className="relative mx-auto mt-16 flex max-w-4xl items-end justify-center">
        <div className="w-full overflow-hidden rounded-xl border border-champagne-100 bg-white shadow-floating">
          <div className="flex items-center gap-1.5 border-b border-champagne-100 bg-champagne-50/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
          </div>
          <div className="space-y-3 bg-gradient-to-b from-forest-50 to-white p-8 text-left animate-fade-in">
            <div className="h-3 w-24 rounded-full bg-champagne-400" />
            <div className="h-5 w-2/3 rounded-full bg-forest-200" />
            <div className="h-3 w-1/2 rounded-full bg-forest-100" />
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="h-16 rounded-lg bg-champagne-100" />
              <div className="h-16 rounded-lg bg-forest-100" />
              <div className="h-16 rounded-lg bg-champagne-100" />
            </div>
          </div>
        </div>

        <div className="absolute -right-2 bottom-[-2.5rem] hidden w-32 overflow-hidden rounded-2xl border-4 border-forest-700 bg-white shadow-floating sm:block md:-right-6 md:w-40">
          <div className="space-y-2 bg-gradient-to-b from-champagne-50 to-white p-3">
            <div className="mx-auto h-2 w-10 rounded-full bg-champagne-400" />
            <div className="h-3 w-3/4 rounded-full bg-forest-200" />
            <div className="h-2 w-1/2 rounded-full bg-forest-100" />
            <div className="mt-3 h-10 rounded-lg bg-champagne-100" />
          </div>
        </div>
      </div>
    </section>
  );
}

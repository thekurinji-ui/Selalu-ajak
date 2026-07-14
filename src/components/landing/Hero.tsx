import Link from "next/link";

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
    </section>
  );
}

import { Star } from "lucide-react";

// BAB 6.3.11 — Testimonials. Format kartu dengan foto (inisial sebagai
// fallback ringan tanpa aset gambar), nama, jenis acara, dan ulasan singkat.
// TODO: hubungkan ke tabel testimoni sungguhan bila sudah tersedia di
// database — untuk saat ini memakai data contoh yang representatif.
const testimonials = [
  {
    name: "Dinda & Raka",
    event: "Pernikahan",
    quote:
      "Semua tamu bisa RSVP lewat WhatsApp tanpa ribet, dan panitia check-in tinggal scan QR di pintu masuk.",
  },
  {
    name: "Putri Amelia",
    event: "Ulang Tahun",
    quote:
      "Editor undangannya gampang dipakai walau saya bukan orang teknis. Tinggal drag and drop, langsung jadi.",
  },
  {
    name: "PT Nusantara Kreatif",
    event: "Corporate Event",
    quote:
      "Laporan kehadiran otomatis dari Analytics sangat membantu tim kami menyusun evaluasi acara.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
        Dipercaya untuk berbagai momen
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
        Cerita dari pengguna yang sudah merayakan acaranya bersama Selalu Ajak.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-lg border border-champagne-100 bg-white p-6 shadow-soft"
          >
            <div className="flex gap-0.5 text-champagne-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm text-slate-600">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 font-heading text-sm font-semibold text-forest-700">
                {t.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-forest-700">{t.name}</span>
                <span className="block text-xs text-slate-500">{t.event}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

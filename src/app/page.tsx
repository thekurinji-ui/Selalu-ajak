import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";

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

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />

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

      <footer className="border-t border-champagne-100 bg-ivory py-10 text-center text-sm text-slate-500">
        <p className="font-heading text-forest-700">Selalu Ajak</p>
        <p className="mt-2">Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya.</p>
        <p className="mt-4">&copy; {new Date().getFullYear()} The Kurinji. Semua hak dilindungi.</p>
      </footer>
    </main>
  );
}

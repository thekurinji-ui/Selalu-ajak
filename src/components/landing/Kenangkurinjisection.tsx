import Link from "next/link";
import { QrCode, Camera, Film, ArrowUpRight } from "lucide-react";

// BAB 6.3.9 — Kenang Kurinji Integration.
//
// Kenang Kurinji adalah produk lain dalam ekosistem The Kurinji: layanan
// "kamera sekali pakai" versi digital berbasis web. Tamu scan QR Code
// acara, kamera langsung terbuka di browser (tanpa install apapun), lalu
// mengambil foto dengan jumlah jepretan terbatas seperti kamera film —
// semua foto otomatis masuk ke galeri digital acara.
//
// Nama "Kurinji" terinspirasi dari bunga Neela Kurinji yang mekar sangat
// jarang — filosofinya, setiap momen berharga layak dikenang karena tidak
// akan terulang dengan cara yang sama.
const howItWorks = [
  { icon: QrCode, text: "Tamu memindai QR Code unik milik acara." },
  { icon: Camera, text: "Kamera langsung terbuka di browser, tanpa install aplikasi." },
  { icon: Film, text: "Foto diambil dengan jumlah jepretan terbatas, gaya kamera film." },
];

const filmFilters = [
  "Kodak FunSaver",
  "Fujifilm QuickSnap",
  "Kodak Portra 400",
  "Kodak Ektar 100",
  "Ilford HP5 Plus",
  "CineStill 800T",
];

export function KenangKurinjiSection() {
  return (
    <section className="bg-forest-700 py-20 text-ivory">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Kolom kiri: konsep & cara kerja */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-champagne-200">
              Bagian dari ekosistem The Kurinji
            </span>
            <h2 className="mt-5 font-heading text-3xl font-semibold">Kenang Kurinji</h2>
            <p className="mt-2 font-heading text-lg italic text-champagne-200">
              &ldquo;Scan. Jepret. Kenang.&rdquo;
            </p>
            <p className="mt-4 max-w-lg text-champagne-100">
              Menghadirkan kembali nostalgia kamera sekali pakai lewat
              teknologi modern. Setiap tamu bisa ikut mengabadikan momen
              acara Anda, dan seluruh hasilnya terkumpul rapi dalam satu
              galeri digital yang bisa dikenang kapan saja.
            </p>

            <ul className="mt-8 space-y-4">
              {howItWorks.map((step, i) => (
                <li key={step.text} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <step.icon className="h-4 w-4 text-champagne-300" aria-hidden />
                  </span>
                  <span className="pt-1.5 text-sm text-champagne-100">
                    <span className="font-medium text-ivory">Langkah {i + 1}.</span>{" "}
                    {step.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="https://kenang.kurinji.asia"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 rounded-md bg-champagne-500 px-6 py-3 text-sm font-medium text-forest-900 shadow-medium transition hover:bg-champagne-400"
            >
              Kunjungi Kenang Kurinji
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {/* Kolom kanan: highlight fitur + daftar filter kamera film */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-champagne-300">
              Filter gaya kamera film
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {filmFilters.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-champagne-100"
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm text-champagne-100">
              <p>🔳 QR Code unik per acara</p>
              <p>📸 Batas jepretan per tamu</p>
              <p>🖼️ Galeri digital untuk semua tamu</p>
              <p>📊 Dashboard statistik penyelenggara</p>
            </div>

            <p className="mt-6 border-t border-white/10 pt-4 text-xs text-champagne-300">
              Segera hadir: AI Best Shot, AI Story, dan AI Smart Gallery —
              untuk otomatis memilih, merangkai, dan mengelompokkan momen
              terbaik dari acara Anda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

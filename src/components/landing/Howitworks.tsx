import { CalendarPlus, Palette, Send, PartyPopper } from "lucide-react";

// BAB 6.3.6 — How It Works. Empat langkah sederhana, disajikan sebagai
// timeline horizontal di desktop dan vertikal di mobile (BAB 6.8 Responsive
// Design).
const steps = [
  { icon: CalendarPlus, title: "Buat acara", desc: "Isi nama, jenis, tanggal, dan lokasi acara dalam hitungan menit." },
  { icon: Palette, title: "Sesuaikan undangan", desc: "Pilih tema, atur warna dan font lewat Invitation Builder drag-and-drop." },
  { icon: Send, title: "Undang tamu", desc: "Tambahkan daftar tamu dan kirim undangan lewat WhatsApp Blast." },
  { icon: PartyPopper, title: "Rayakan momen", desc: "Pantau RSVP, check-in tamu via QR, dan nikmati harinya." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
        Empat langkah menuju acara yang siap
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
        Dari ide sampai hari-H, semua alurnya sederhana dan bisa Anda kerjakan sendiri.
      </p>

      <div className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
        {/* Garis penghubung — hanya tampil di layar medium ke atas */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-7 hidden h-px bg-champagne-200 md:block"
        />
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex flex-col items-center text-center md:items-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-champagne-200 bg-white shadow-soft">
                <Icon className="h-6 w-6 text-forest-600" aria-hidden />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-champagne-600">
                Langkah {i + 1}
              </p>
              <h3 className="mt-1 font-heading text-lg font-medium text-forest-700">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Users, CheckCircle2, QrCode, MessageCircle, BarChart3 } from "lucide-react";

// BAB 6.3.8 — Dashboard Preview. Menampilkan cuplikan dashboard Selalu Ajak
// beserta modul-modul utamanya. Mockup dibangun dengan markup/CSS (bukan
// screenshot) agar konsisten dengan Hero dan ringan di-load.
const modules = [
  { icon: Users, label: "Guest List", value: "248 tamu", tone: "bg-forest-50 text-forest-700" },
  { icon: CheckCircle2, label: "RSVP", value: "192 hadir", tone: "bg-champagne-50 text-champagne-700" },
  { icon: QrCode, label: "QR Check-in", value: "156 check-in", tone: "bg-forest-50 text-forest-700" },
  { icon: MessageCircle, label: "WhatsApp Blast", value: "248 terkirim", tone: "bg-champagne-50 text-champagne-700" },
  { icon: BarChart3, label: "Analytics", value: "3.2k kunjungan", tone: "bg-forest-50 text-forest-700" },
];

export function DashboardPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-semibold text-forest-700">
            Semua terpantau dalam satu dashboard
          </h2>
          <p className="mt-4 text-slate-600">
            Guest List, RSVP, QR Check-in, WhatsApp Blast, hingga Analytics —
            seluruh data acara Anda terpusat, real-time, dan mudah dipahami
            tanpa perlu membuka banyak aplikasi.
          </p>
          <ul className="mt-6 space-y-3">
            {modules.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-sm text-slate-700">
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${m.tone}`}>
                  <m.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="font-medium text-forest-700">{m.label}</span>
                <span className="text-slate-500">— {m.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-champagne-100 bg-white shadow-floating">
          <div className="flex items-center gap-1.5 border-b border-champagne-100 bg-champagne-50/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-champagne-300" />
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            {modules.slice(0, 4).map((m) => (
              <div key={m.label} className="rounded-lg border border-champagne-100 p-4">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${m.tone}`}>
                  <m.icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 text-xs text-slate-500">{m.label}</p>
                <p className="font-heading text-lg font-semibold text-forest-700">{m.value}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-lg border border-champagne-100 p-4">
              <div className="flex items-end gap-1.5">
                {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-full rounded-t bg-forest-200"
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">Analytics — kunjungan 7 hari terakhir</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

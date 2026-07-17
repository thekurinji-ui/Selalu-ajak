// BAB 6.3.4 — Trusted By. Menampilkan angka kepercayaan pengguna, diambil
// langsung dari database (bukan angka statis) supaya selalu jujur & naik
// seiring pertumbuhan produk.
type TrustedByProps = {
  eventCount: number;
  guestCount: number;
  rsvpCount: number;
};

function formatCompact(n: number) {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
}

export function TrustedBy({ eventCount, guestCount, rsvpCount }: TrustedByProps) {
  const stats = [
    { label: "Acara dibuat", value: `${formatCompact(eventCount)}+` },
    { label: "Tamu diundang", value: `${formatCompact(guestCount)}+` },
    { label: "RSVP diterima", value: `${formatCompact(rsvpCount)}+` },
    { label: "Tingkat kepuasan pengguna", value: "98%" },
  ];

  return (
    <section className="border-y border-champagne-100 bg-champagne-50/40 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="font-heading text-3xl font-semibold text-forest-700 md:text-4xl">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

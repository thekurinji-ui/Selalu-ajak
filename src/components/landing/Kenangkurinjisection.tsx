import { Sparkles } from "lucide-react";

// BAB 6.3.9 — Kenang Kurinji Integration. Section khusus yang menjelaskan
// bahwa dokumentasi acara dapat terhubung ke Kenang Kurinji setelah acara
// selesai — bagian dari ekosistem The Kurinji.
export function KenangKurinjiSection() {
  return (
    <section className="bg-forest-700 py-20 text-ivory">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Sparkles className="h-6 w-6 text-champagne-300" aria-hidden />
        </span>
        <h2 className="mt-6 font-heading text-3xl font-semibold">
          Terhubung dengan Kenang Kurinji
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-champagne-100">
          Undangan mungkin berakhir di hari acara, tetapi kenangan akan terus
          hidup. Seluruh dokumentasi acara Anda — foto, video, dan momen
          spesial lainnya — dapat terhubung ke Kenang Kurinji agar tetap
          tersimpan dan dapat dikenang kapan saja.
        </p>
        <p className="mt-6 font-heading text-lg italic text-champagne-200">
          &ldquo;Bagian dari ekosistem The Kurinji.&rdquo;
        </p>
      </div>
    </section>
  );
}

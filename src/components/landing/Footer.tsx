import Link from "next/link";
import { Instagram, Facebook, Youtube } from "lucide-react";

// BAB 6.3.15 — Footer. Logo, tagline, menu navigasi, bantuan, blog,
// kebijakan privasi, syarat & ketentuan, kontak, dan media sosial.
const columns = [
  {
    title: "Produk",
    links: [
      { href: "/#fitur", label: "Fitur" },
      { href: "/#template", label: "Template" },
      { href: "/#harga", label: "Harga" },
    ],
  },
  {
    title: "Sumber Daya",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/#faq", label: "Bantuan" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
      { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
    ],
  },
];

const socials = [
  { href: "https://instagram.com/selaluajak", label: "Instagram", icon: Instagram },
  { href: "https://facebook.com/selaluajak", label: "Facebook", icon: Facebook },
  { href: "https://youtube.com/@selaluajak", label: "YouTube", icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-champagne-100 bg-ivory">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-heading text-lg font-semibold text-forest-700">Selalu Ajak</p>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Ajak Mereka, Rayakan Ceritanya, Kenang Selamanya. Bagian dari
              ekosistem The Kurinji.
            </p>
            <div className="mt-4 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-200 text-slate-500 transition hover:border-forest-300 hover:text-forest-700"
                >
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-forest-700">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-forest-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-medium text-forest-700">Kontak</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <a href="mailto:halo@selaluajak.id" className="hover:text-forest-600">
                  halo@selaluajak.id
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6280000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-forest-600"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-champagne-100 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} The Kurinji. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}

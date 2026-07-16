import Link from "next/link";
import { auth } from "@/lib/auth";

const links = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#template", label: "Template" },
  { href: "/#harga", label: "Harga" },
  { href: "/blog", label: "Blog" },
];

// Server component — cek session langsung lewat `auth()` supaya tombol
// Login/Register otomatis berganti jadi link ke Dashboard begitu user login,
// termasuk saat kembali ke Home (`/`) setelah login.
export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-champagne-100 bg-ivory/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-lg font-semibold text-forest-700">
          Selalu Ajak
        </Link>
        <nav className="hidden gap-8 text-sm text-slate-700 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-forest-600">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <Link
              href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-forest-700"
            >
              Ke Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-forest-600">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-forest-700"
              >
                Buat Acara Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

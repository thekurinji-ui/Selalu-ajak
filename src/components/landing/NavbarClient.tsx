"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#template", label: "Template" },
  { href: "/#harga", label: "Harga" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

type NavbarClientProps = {
  authHref: string | null;
  authLabel: string;
};

// BAB 6.3.2 — Navigation Bar. Server component (Navbar.tsx) mengecek session
// lewat auth() lalu meneruskan hasilnya ke sini sebagai props, supaya bagian
// yang butuh interaksi browser (scroll listener, menu mobile) tetap bisa
// jadi Client Component tanpa perlu fetch session ulang di sisi client.
export function NavbarClient({ authHref, authLabel }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all",
        scrolled
          ? "border-champagne-100 bg-ivory/90 shadow-soft backdrop-blur"
          : "border-transparent bg-ivory/60 backdrop-blur-sm",
      )}
    >
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

        <div className="hidden items-center gap-3 md:flex">
          {authHref ? (
            <Link
              href={authHref}
              className="rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-forest-700"
            >
              {authLabel}
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

        {/* Tombol menu mobile — memenuhi BAB 6.8 Responsive Design & 6.9
            Accessibility (target sentuh cukup besar, aria-label jelas). */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          className="rounded-md p-2 text-forest-700 hover:bg-forest-50 md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-champagne-100 bg-ivory px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-slate-700">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="hover:text-forest-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3 border-t border-champagne-100 pt-4">
            {authHref ? (
              <Link
                href={authHref}
                onClick={() => setMobileOpen(false)}
                className="rounded-md bg-forest-600 px-4 py-2 text-center text-sm font-medium text-white shadow-soft"
              >
                {authLabel}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-champagne-200 px-4 py-2 text-center text-sm font-medium text-forest-700"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md bg-forest-600 px-4 py-2 text-center text-sm font-medium text-white shadow-soft"
                >
                  Buat Acara Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

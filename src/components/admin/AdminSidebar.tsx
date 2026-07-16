"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CalendarHeart,
  CreditCard,
  ScrollText,
  ArrowLeftCircle,
  LayoutTemplate,
  LogOut,
} from "lucide-react";

// BAB 21.3–21.11 — Struktur Admin Console
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/events", label: "Acara", icon: CalendarHeart },
  { href: "/admin/templates", label: "Template", icon: LayoutTemplate },
  { href: "/admin/subscriptions", label: "Langganan", icon: CreditCard },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 md:block">
      <div className="p-6">
        <p className="font-heading text-lg font-semibold text-white">Selalu Ajak</p>
        <p className="text-xs uppercase tracking-widest text-amber-400">Admin Console</p>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        <Link
          href="/dashboard"
          className="mt-4 flex items-center gap-3 rounded-md border-t border-slate-800 px-3 pt-4 text-sm font-medium text-slate-500 hover:text-white"
        >
          <ArrowLeftCircle size={18} />
          Kembali ke Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </aside>
  );
}

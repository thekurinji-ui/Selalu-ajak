"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarHeart,
  Users,
  CheckSquare,
  QrCode,
  MessageCircle,
  Gift,
  BarChart3,
  Settings,
  CreditCard,
} from "lucide-react";

// BAB 8.3 — Struktur Dashboard
const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "Events", icon: CalendarHeart },
  { href: "/dashboard/guests", label: "Guests", icon: Users },
  { href: "/dashboard/rsvp", label: "RSVP", icon: CheckSquare },
  { href: "/dashboard/checkin", label: "QR Check-in", icon: QrCode },
  { href: "/dashboard/whatsapp", label: "WhatsApp Blast", icon: MessageCircle },
  { href: "/dashboard/gift", label: "Gift", icon: Gift },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-champagne-100 bg-white md:block">
      <div className="p-6">
        <Link href="/" className="font-heading text-lg font-semibold text-forest-700">
          Selalu Ajak
        </Link>
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
                  ? "bg-forest-50 text-forest-700"
                  : "text-slate-600 hover:bg-champagne-50 hover:text-forest-700",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

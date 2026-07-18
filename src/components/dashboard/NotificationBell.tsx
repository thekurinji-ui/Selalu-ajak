"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type NotificationItem = {
  id: string;
  category: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

const CATEGORY_ICON: Record<string, string> = {
  event: "🎉",
  rsvp: "💌",
  whatsapp: "📲",
  checkin: "✅",
  subscription: "💳",
  account: "👤",
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

// BAB 20.10 & 20.14 — Ikon lonceng dengan badge unread di header Dashboard,
// panel notifikasi bisa dibuka tanpa meninggalkan halaman (desktop/tablet).
export function NotificationBell({
  unreadCount,
  notifications,
  onMarkRead,
}: {
  unreadCount: number;
  notifications: NotificationItem[];
  onMarkRead: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-champagne-50 hover:text-forest-700"
        aria-label="Notifikasi"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-lg border border-champagne-100 bg-white shadow-medium">
          <div className="flex items-center justify-between border-b border-champagne-50 px-4 py-3">
            <p className="font-heading text-sm font-semibold text-forest-700">Notifikasi</p>
            {unreadCount > 0 && (
              <form action={onMarkRead}>
                <input type="hidden" name="all" value="true" />
                <button type="submit" className="text-xs font-medium text-forest-600 hover:underline">
                  Tandai semua dibaca
                </button>
              </form>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Belum ada notifikasi.</p>
            ) : (
              notifications.map((n) => (
                <form key={n.id} action={onMarkRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className={`flex w-full gap-3 border-b border-champagne-50 px-4 py-3 text-left text-sm transition hover:bg-champagne-50/50 ${
                      !n.readAt ? "bg-forest-50/40" : ""
                    }`}
                  >
                    <span className="text-lg">{CATEGORY_ICON[n.category] ?? "🔔"}</span>
                    <span className="flex-1">
                      <span className="block font-medium text-slate-800">{n.title}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 line-clamp-2">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-forest-600" />}
                  </button>
                </form>
              ))
            )}
          </div>

          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-champagne-50 px-4 py-3 text-center text-xs font-medium text-forest-600 hover:bg-champagne-50/50"
          >
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
}

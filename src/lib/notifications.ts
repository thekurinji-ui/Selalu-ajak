import { prisma } from "@/lib/prisma";

// BAB 20 — Notification Center
//
// Satu sumber buat semua modul lain (Event Builder, RSVP, WhatsApp Blast,
// QR Check-in, Subscription & Billing, Account Management) bikin notifikasi
// in-app (20.11). Menghormati preferensi user (20.7) — kalau kategori
// tertentu dimatikan di /dashboard/settings, notifikasi kategori itu tidak
// dibuat sama sekali (bukan dibuat lalu disembunyikan).

export type NotificationCategory =
  | "event"
  | "rsvp"
  | "whatsapp"
  | "checkin"
  | "subscription"
  | "account";

// Kategori yang bisa dimatikan lewat preferensi (20.7). "event" & "checkin"
// sengaja tidak termasuk daftar preferensi karena berisi info operasional
// acara yang berlangsung, bukan hanya info FYI.
const PREFERENCE_KEYS: Record<string, NotificationCategory> = {
  rsvp: "rsvp",
  whatsapp: "whatsapp",
  subscription: "subscription",
  account: "account",
};

async function isCategoryEnabled(userId: string, category: NotificationCategory): Promise<boolean> {
  const prefKey = Object.keys(PREFERENCE_KEYS).find((k) => PREFERENCE_KEYS[k] === category);
  if (!prefKey) return true; // kategori tanpa toggle preferensi selalu aktif

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  const prefs = (user?.notificationPreferences as Record<string, boolean> | null) ?? {};
  return prefs[prefKey] !== false; // default aktif kalau belum pernah di-set
}

export async function createNotification(params: {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
}): Promise<void> {
  try {
    const enabled = await isCategoryEnabled(params.userId, params.category);
    if (!enabled) return;

    await prisma.notification.create({
      data: {
        userId: params.userId,
        category: params.category,
        title: params.title,
        body: params.body,
      },
    });
  } catch (err) {
    // Notifikasi adalah efek samping, bukan alur utama — kegagalan bikin
    // notifikasi tidak boleh menggagalkan proses yang memicunya (mis. bikin
    // acara tetap berhasil walau notifikasinya gagal tersimpan).
    console.error("Gagal membuat notifikasi:", err);
  }
}

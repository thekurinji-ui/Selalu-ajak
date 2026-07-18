import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 20.4, 20.5, 20.6, 20.12 — Notification Inbox: daftar lengkap semua
// notifikasi, status baca/arsip, filter kategori + rentang waktu, dan
// pencarian kata kunci.

const CATEGORY_LABEL: Record<string, string> = {
  event: "Acara",
  rsvp: "RSVP",
  whatsapp: "WhatsApp Blast",
  checkin: "QR Check-in",
  subscription: "Langganan",
  account: "Akun",
};
const CATEGORY_ICON: Record<string, string> = {
  event: "🎉",
  rsvp: "💌",
  whatsapp: "📲",
  checkin: "✅",
  subscription: "💳",
  account: "👤",
};

async function markRead(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const id = formData.get("id") as string;
  await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { readAt: new Date() } });
}

async function markUnread(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const id = formData.get("id") as string;
  await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { readAt: null } });
}

async function archiveNotification(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const id = formData.get("id") as string;
  await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { archivedAt: new Date() } });
}

async function markAllRead(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const category = (formData.get("category") as string) || undefined;
  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null, ...(category ? { category } : {}) },
    data: { readAt: new Date() },
  });
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string; q?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { category, status, q } = searchParams;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category } : {}),
      ...(status === "unread" ? { readAt: null, archivedAt: null } : {}),
      ...(status === "archived" ? { archivedAt: { not: null } } : {}),
      ...(status !== "archived" && status !== "unread" ? { archivedAt: null } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { body: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const categories = Object.keys(CATEGORY_LABEL);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-forest-700">Notifikasi</h1>
          <p className="mt-1 text-sm text-slate-500">Semua pemberitahuan aktivitas akun & acara Anda.</p>
        </div>
        <form action={markAllRead}>
          {category && <input type="hidden" name="category" value={category} />}
          <Button type="submit" variant="ghost">
            Tandai Semua Dibaca
          </Button>
        </form>
      </div>

      {/* BAB 20.6 — Filter & Pencarian */}
      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        <Input name="q" defaultValue={q ?? ""} placeholder="Cari notifikasi..." className="max-w-xs" />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
        >
          <option value="">Semua Jenis</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
        >
          <option value="">Semua Status</option>
          <option value="unread">Belum Dibaca</option>
          <option value="archived">Diarsipkan</option>
        </select>
        <Button type="submit" variant="ghost">
          Terapkan
        </Button>
      </form>

      <div className="mt-6 divide-y divide-champagne-50 rounded-lg border border-champagne-100 bg-white shadow-soft">
        {notifications.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-slate-400">Tidak ada notifikasi untuk filter ini.</p>
        )}
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 px-6 py-4 ${!n.readAt ? "bg-forest-50/30" : ""}`}>
            <span className="text-xl">{CATEGORY_ICON[n.category] ?? "🔔"}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-800">{n.title}</p>
                <span className="rounded-full bg-champagne-100 px-2 py-0.5 text-[11px] font-medium text-forest-700">
                  {CATEGORY_LABEL[n.category] ?? n.category}
                </span>
                {!n.readAt && <span className="h-2 w-2 rounded-full bg-forest-600" />}
              </div>
              <p className="mt-1 text-sm text-slate-600">{n.body}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleString("id-ID")}
                {n.readAt && ` • Dibaca ${new Date(n.readAt).toLocaleString("id-ID")}`}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {n.readAt ? (
                <form action={markUnread}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" variant="ghost" className="text-xs">
                    Tandai Belum Dibaca
                  </Button>
                </form>
              ) : (
                <form action={markRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" variant="ghost" className="text-xs">
                    Tandai Dibaca
                  </Button>
                </form>
              )}
              {!n.archivedAt && (
                <form action={archiveNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" variant="ghost" className="text-xs">
                    Arsipkan
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
      }

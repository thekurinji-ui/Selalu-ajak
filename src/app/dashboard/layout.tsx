import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// BAB 20.10 & 20.14 — badge & ikon lonceng notifikasi tampil di header,
// konsisten di semua halaman dashboard (bukan cuma 1 halaman tertentu).
async function markNotificationRead(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = formData.get("id") as string | null;
  const all = formData.get("all") === "true";

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return;
  }

  if (id) {
    // where userId disertakan biar user lain nggak bisa nandain notifikasi orang lain lewat id tebakan.
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { readAt: new Date() },
    });
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role
    ? ["ADMIN", "SUPPORT", "FINANCE", "CONTENT_MANAGER", "DEVELOPER"].includes(session.user.role)
    : false;

  const [unreadCount, notifications] = session?.user?.id
    ? await Promise.all([
        prisma.notification.count({ where: { userId: session.user.id, readAt: null, archivedAt: null } }),
        prisma.notification.findMany({
          where: { userId: session.user.id, archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ])
    : [0, []];

  return (
    <div className="flex min-h-screen bg-ivory-200">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1">
        <header className="flex items-center justify-end border-b border-champagne-100 bg-white px-6 py-3">
          <NotificationBell unreadCount={unreadCount} notifications={notifications} onMarkRead={markNotificationRead} />
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

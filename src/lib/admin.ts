import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// BAB 21.12 — Role & Permission
// Super Admin (ADMIN) akses penuh. Peran lain dibatasi ke area yang relevan
// dengan tanggung jawabnya. Semua peran berikut boleh MASUK Admin Console,
// tapi halaman masing-masing (users, subscriptions, dst.) bisa membatasi
// lebih lanjut kalau perlu di kemudian hari.
const ADMIN_ROLES: Role[] = ["ADMIN", "SUPPORT", "FINANCE", "CONTENT_MANAGER", "DEVELOPER"];

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!ADMIN_ROLES.includes(session.user.role)) redirect("/dashboard");
  return session;
}

// Beberapa aksi (hapus akun, ubah langganan, dsb.) hanya untuk ADMIN penuh.
export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.user.role !== "ADMIN") redirect("/admin");
  return session;
}

// BAB 21.11 — Audit Log: setiap aksi administratif dicatat.
export async function logAdminAction(
  adminUserId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: { userId: adminUserId, action, metadata: metadata ?? undefined },
  });
}

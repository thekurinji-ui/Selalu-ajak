import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// BAB 21.1 — Admin Console hanya bisa diakses staf dengan hak akses sesuai peran.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}

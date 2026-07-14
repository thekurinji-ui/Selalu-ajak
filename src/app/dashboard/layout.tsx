import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role
    ? ["ADMIN", "SUPPORT", "FINANCE", "CONTENT_MANAGER", "DEVELOPER"].includes(session.user.role)
    : false;

  return (
    <div className="flex min-h-screen bg-ivory-200">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

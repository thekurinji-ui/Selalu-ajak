import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

// BAB Template Management — Admin/Content Manager kelola katalog template
// undangan yang bisa dipakai user di Invitation Builder.
export default async function AdminTemplatesPage() {
  await requireAdmin();

  const templates = await prisma.invitationTemplate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { events: true } } },
  });

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-slate-700/40 text-slate-300",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400",
    ARCHIVED: "bg-slate-800 text-slate-500",
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-white">Template Undangan</h1>
          <p className="mt-1 text-sm text-slate-400">
            Katalog template yang bisa dipilih pengguna saat membuat undangan.
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-300"
        >
          <Plus size={16} />
          Upload Template Baru
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-slate-800 bg-slate-950 p-10 text-center text-slate-500">
            Belum ada template. Klik &quot;Upload Template Baru&quot; untuk mulai.
          </div>
        )}

        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/admin/templates/${t.id}/edit`}
            className="group overflow-hidden rounded-lg border border-slate-800 bg-slate-950 transition hover:border-amber-400/50"
          >
            <div className="relative aspect-[3/4] w-full bg-slate-900">
              <Image
                src={t.thumbnailUrl}
                alt={t.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition group-hover:scale-105"
              />
              {t.isPremium && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold text-slate-900">
                  PREMIUM
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="truncate font-medium text-white">{t.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", statusStyles[t.status])}>
                  {t.status}
                </span>
                <span className="text-xs text-slate-500">{t._count.events} dipakai</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

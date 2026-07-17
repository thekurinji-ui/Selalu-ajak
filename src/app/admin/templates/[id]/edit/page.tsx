import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { TemplateForm } from "@/components/admin/TemplateForm";
import { DeleteTemplateButton } from "@/components/admin/DeleteTemplateButton";

// BAB Template Management — halaman edit template yang sudah ada.
export default async function EditTemplatePage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const template = await prisma.invitationTemplate.findUnique({
    where: { id: params.id },
    include: { _count: { select: { events: true } } },
  });

  if (!template) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Kembali ke Template
        </Link>
        <DeleteTemplateButton templateId={template.id} eventsUsingTemplate={template._count.events} />
      </div>

      <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Edit Template</h1>
      <p className="mt-1 text-sm text-slate-400">
        {template._count.events > 0
          ? `Dipakai oleh ${template._count.events} acara. Perubahan di sini tidak mengubah acara yang sudah dibuat.`
          : "Belum dipakai acara manapun."}
      </p>

      <TemplateForm
        initialData={{
          id: template.id,
          name: template.name,
          slug: template.slug,
          description: template.description,
          eventType: template.eventType,
          primaryColor: template.primaryColor,
          defaultThemeId: template.defaultThemeId,
          isPremium: template.isPremium,
          status: template.status,
          thumbnailUrl: template.thumbnailUrl,
          defaultSections: template.defaultSections,
        }}
      />
    </div>
  );
}

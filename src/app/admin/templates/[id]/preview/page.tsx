import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { parseSections } from "@/lib/invitation-sections";
import { TemplatePreviewCanvas } from "@/components/admin/TemplatePreviewCanvas";

// BAB Template Management — halaman preview: lihat hasil `defaultSections`
// sebuah template sebagai tampilan undangan sungguhan.
export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const template = await prisma.invitationTemplate.findUnique({ where: { id: params.id } });
  if (!template) notFound();

  const sections = parseSections(template.defaultSections);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
        <Link
          href="/admin/templates"
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>
        <p className="font-heading text-sm font-medium text-white">{template.name} — Preview</p>
        <Link
          href={`/admin/templates/${template.id}/edit`}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>

      <TemplatePreviewCanvas sections={sections} templateName={template.name} primaryColor={template.primaryColor} />
    </div>
  );
}

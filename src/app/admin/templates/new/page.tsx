import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { TemplateForm } from "@/components/admin/TemplateForm";

// BAB Template Management — halaman upload template baru.
export default async function NewTemplatePage() {
  await requireAdmin();

  return (
    <div>
      <Link
        href="/admin/templates"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Kembali ke Template
      </Link>

      <h1 className="mt-3 font-heading text-2xl font-semibold text-white">Upload Template Baru</h1>
      <p className="mt-1 text-sm text-slate-400">
        Isi detail template dan upload thumbnail. Template bisa disimpan sebagai Draft dulu sebelum dipublish.
      </p>

      <TemplateForm />
    </div>
  );
}

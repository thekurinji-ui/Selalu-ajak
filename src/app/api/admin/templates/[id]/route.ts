import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin";
import { uploadImageToR2, deleteImageFromR2 } from "@/lib/r2";
import { templateSchema } from "@/lib/validation";
import type { Role } from "@prisma/client";

const TEMPLATE_MANAGER_ROLES: Role[] = ["ADMIN", "CONTENT_MANAGER"];

async function requireTemplateManager() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!TEMPLATE_MANAGER_ROLES.includes(session.user.role)) return null;
  return session;
}

// GET /api/admin/templates/[id] — detail satu template
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireTemplateManager();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const template = await prisma.invitationTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) {
    return NextResponse.json({ status: "error", message: "Template tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ status: "success", data: template });
}

// PATCH /api/admin/templates/[id] — edit template, thumbnail baru bersifat opsional
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireTemplateManager();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.invitationTemplate.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ status: "error", message: "Template tidak ditemukan." }, { status: 404 });
  }

  const formData = await req.formData();
  const thumbnailFile = formData.get("thumbnail");

  const rawFields = {
    name: formData.get("name") ?? existing.name,
    slug: formData.get("slug") ?? existing.slug,
    description: formData.get("description") ?? existing.description ?? undefined,
    eventType: formData.get("eventType") || existing.eventType || undefined,
    primaryColor: formData.get("primaryColor") ?? existing.primaryColor ?? undefined,
    isPremium: formData.get("isPremium") ?? existing.isPremium,
    status: formData.get("status") ?? existing.status,
    defaultSections: formData.get("defaultSections") ?? JSON.stringify(existing.defaultSections),
  };

  const parsed = templateSchema.safeParse(rawFields);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  let defaultSectionsJson: unknown;
  try {
    defaultSectionsJson = JSON.parse(parsed.data.defaultSections);
  } catch {
    return NextResponse.json(
      { status: "error", message: "Struktur section (defaultSections) harus JSON yang valid." },
      { status: 400 },
    );
  }

  // Kalau slug diganti, pastikan tidak bentrok dengan template lain
  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await prisma.invitationTemplate.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (slugTaken) {
      return NextResponse.json(
        { status: "error", message: "Slug sudah dipakai template lain." },
        { status: 409 },
      );
    }
  }

  // Kalau ada thumbnail baru, upload dulu baru hapus yang lama (biar aman kalau upload gagal)
  let thumbnailUrl = existing.thumbnailUrl;
  if (thumbnailFile instanceof File && thumbnailFile.size > 0) {
    try {
      thumbnailUrl = await uploadImageToR2(thumbnailFile, "templates/thumbnails");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal upload thumbnail.";
      return NextResponse.json({ status: "error", message }, { status: 400 });
    }
    await deleteImageFromR2(existing.thumbnailUrl);
  }

  const updated = await prisma.invitationTemplate.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      eventType: parsed.data.eventType,
      primaryColor: parsed.data.primaryColor,
      isPremium: parsed.data.isPremium,
      status: parsed.data.status,
      thumbnailUrl,
      defaultSections: defaultSectionsJson as object,
    },
  });

  await logAdminAction(session.user.id, "template.updated", {
    templateId: updated.id,
    name: updated.name,
  });

  return NextResponse.json({ status: "success", data: updated });
}

// DELETE /api/admin/templates/[id] — hapus template + thumbnail di R2
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireTemplateManager();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.invitationTemplate.findUnique({
    where: { id: params.id },
    include: { _count: { select: { events: true } } },
  });

  if (!existing) {
    return NextResponse.json({ status: "error", message: "Template tidak ditemukan." }, { status: 404 });
  }

  await prisma.invitationTemplate.delete({ where: { id: params.id } });
  await deleteImageFromR2(existing.thumbnailUrl);

  await logAdminAction(session.user.id, "template.deleted", {
    templateId: existing.id,
    name: existing.name,
    eventsUsingTemplate: existing._count.events,
  });

  return NextResponse.json({ status: "success", message: "Template berhasil dihapus." });
}

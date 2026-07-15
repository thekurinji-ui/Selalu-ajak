import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin";
import { uploadImageToR2 } from "@/lib/r2";
import { templateSchema } from "@/lib/validation";
import type { Role } from "@prisma/client";

// BAB Template Management — hanya role ini yang boleh kelola katalog template
const TEMPLATE_MANAGER_ROLES: Role[] = ["ADMIN", "CONTENT_MANAGER"];

async function requireTemplateManager() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!TEMPLATE_MANAGER_ROLES.includes(session.user.role)) return null;
  return session;
}

// GET /api/admin/templates — list semua template (termasuk yang DRAFT/ARCHIVED)
export async function GET() {
  const session = await requireTemplateManager();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.invitationTemplate.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ status: "success", data: templates });
}

// POST /api/admin/templates — upload template baru
// Dikirim sebagai multipart/form-data karena ada file thumbnail.
export async function POST(req: Request) {
  const session = await requireTemplateManager();
  if (!session) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const thumbnailFile = formData.get("thumbnail");

  if (!(thumbnailFile instanceof File) || thumbnailFile.size === 0) {
    return NextResponse.json(
      { status: "error", message: "Gambar thumbnail wajib diupload." },
      { status: 400 },
    );
  }

  const rawFields = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    eventType: formData.get("eventType") || undefined,
    primaryColor: formData.get("primaryColor") || undefined,
    isPremium: formData.get("isPremium"),
    status: formData.get("status") || "DRAFT",
    defaultSections: formData.get("defaultSections"),
  };

  const parsed = templateSchema.safeParse(rawFields);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  // Validasi defaultSections harus JSON valid sebelum disimpan
  let defaultSectionsJson: unknown;
  try {
    defaultSectionsJson = JSON.parse(parsed.data.defaultSections);
  } catch {
    return NextResponse.json(
      { status: "error", message: "Struktur section (defaultSections) harus JSON yang valid." },
      { status: 400 },
    );
  }

  const existingSlug = await prisma.invitationTemplate.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return NextResponse.json(
      { status: "error", message: "Slug sudah dipakai template lain, coba nama/slug berbeda." },
      { status: 409 },
    );
  }

  let thumbnailUrl: string;
  try {
    thumbnailUrl = await uploadImageToR2(thumbnailFile, "templates/thumbnails");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal upload thumbnail.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }

  const template = await prisma.invitationTemplate.create({
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
      createdById: session.user.id,
    },
  });

  await logAdminAction(session.user.id, "template.created", {
    templateId: template.id,
    name: template.name,
  });

  return NextResponse.json({ status: "success", data: template }, { status: 201 });
}

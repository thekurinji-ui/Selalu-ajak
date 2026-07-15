import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSections, sectionsSchema } from "@/lib/invitation-sections";
import { THEME_PRESETS, FONT_PAIRS } from "@/lib/invitation-themes";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Format warna harus hex, mis. #25402F")
  .nullable();

// BAB 10.9 — Auto Save
// GET  /api/invitation?eventId=...  -> memuat sections + pengaturan untuk editor
// PUT  /api/invitation              -> menyimpan perubahan (dipanggil dari autosave)

async function getOwnedEvent(eventId: string, userId: string) {
  return prisma.event.findFirst({
    where: { id: eventId, userId },
    include: { invitationPage: true },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId wajib diisi" }, { status: 400 });
  }

  const event = await getOwnedEvent(eventId, session.user.id);
  if (!event) {
    return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    sections: parseSections(event.invitationPage?.sections),
    settings: {
      metaTitle: event.invitationPage?.metaTitle ?? event.name,
      metaDesc: event.invitationPage?.metaDesc ?? "",
      rsvpEnabled: event.invitationPage?.rsvpEnabled ?? true,
      wishesEnabled: event.invitationPage?.wishesEnabled ?? true,
    },
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      date: event.date,
      location: event.location,
      address: event.address,
      description: event.description,
      coverImageUrl: event.coverImageUrl,
      theme: event.theme,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      backgroundColor: event.backgroundColor,
      fontId: event.fontId,
      musicUrl: event.musicUrl,
    },
  });
}

const putBodySchema = z.object({
  eventId: z.string().min(1),
  sections: sectionsSchema,
  settings: z
    .object({
      metaTitle: z.string().optional(),
      metaDesc: z.string().optional(),
      rsvpEnabled: z.boolean().optional(),
      wishesEnabled: z.boolean().optional(),
    })
    .optional(),
  // BAB 10.6 — Theme System. `theme` di sini adalah id preset dari
  // THEME_PRESETS; primaryColor/secondaryColor/backgroundColor adalah
  // override opsional (null = pakai warna bawaan preset).
  theme: z
    .object({
      theme: z
        .string()
        .refine((id) => THEME_PRESETS.some((t) => t.id === id), "Preset tema tidak dikenali"),
      primaryColor: hexColor.optional(),
      secondaryColor: hexColor.optional(),
      backgroundColor: hexColor.optional(),
      fontId: z
        .string()
        .refine((id) => Boolean(FONT_PAIRS[id]), "Pasangan font tidak dikenali"),
    })
    .optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = putBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid", details: parsed.error.flatten() }, { status: 422 });
  }

  const { eventId, sections, settings, theme } = parsed.data;
  const event = await getOwnedEvent(eventId, session.user.id);
  if (!event) {
    return NextResponse.json({ error: "Acara tidak ditemukan" }, { status: 404 });
  }

  const sectionsJson = sections as unknown as object[];

  const saved = await prisma.invitationPage.upsert({
    where: { eventId },
    create: {
      eventId,
      sections: sectionsJson,
      metaTitle: settings?.metaTitle,
      metaDesc: settings?.metaDesc,
      rsvpEnabled: settings?.rsvpEnabled ?? true,
      wishesEnabled: settings?.wishesEnabled ?? true,
    },
    update: {
      sections: sectionsJson,
      ...(settings?.metaTitle !== undefined ? { metaTitle: settings.metaTitle } : {}),
      ...(settings?.metaDesc !== undefined ? { metaDesc: settings.metaDesc } : {}),
      ...(settings?.rsvpEnabled !== undefined ? { rsvpEnabled: settings.rsvpEnabled } : {}),
      ...(settings?.wishesEnabled !== undefined ? { wishesEnabled: settings.wishesEnabled } : {}),
    },
  });

  // BAB 10.6 — Theme System: field tema hidup di tabel Event (bukan
  // InvitationPage), jadi disimpan lewat query terpisah, tetap dalam alur
  // Auto Save yang sama.
  if (theme) {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        theme: theme.theme,
        primaryColor: theme.primaryColor ?? null,
        secondaryColor: theme.secondaryColor ?? null,
        backgroundColor: theme.backgroundColor ?? null,
        fontId: theme.fontId,
      },
    });
  }

  await prisma.auditLog
    .create({
      data: {
        userId: session.user.id,
        eventId,
        action: "INVITATION_SECTIONS_SAVED",
        metadata: { invitationPageId: saved.id, sectionCount: sections.length },
      },
    })
    .catch(() => {
      // AuditLog bersifat best-effort; kegagalan log tidak boleh menggagalkan autosave.
    });

  return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
}

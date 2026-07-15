import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToR2 } from "@/lib/r2";

// BAB 10.7 — Customization tanpa kode.
// Endpoint ini dipakai Invitation Builder supaya client bisa UPLOAD foto
// miliknya sendiri (cover, foto mempelai, galeri, dst) langsung dari device,
// bukan cuma tempel link dari luar. File masuk ke folder khusus per event
// di R2: "invitations/<eventId>/<uuid>.<ext>".
//
// POST /api/invitation/upload-image
// Body: multipart/form-data { eventId: string, file: File }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ status: "error", message: "Data upload tidak valid." }, { status: 400 });
  }

  const eventId = formData.get("eventId");
  const file = formData.get("file");

  if (typeof eventId !== "string" || !eventId) {
    return NextResponse.json({ status: "error", message: "eventId wajib diisi." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ status: "error", message: "File foto wajib diupload." }, { status: 400 });
  }

  // Pastikan event ini benar-benar milik user yang sedang login —
  // sama seperti pengecekan kepemilikan di PUT /api/invitation.
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId: session.user.id },
    select: { id: true },
  });
  if (!event) {
    return NextResponse.json({ status: "error", message: "Acara tidak ditemukan." }, { status: 404 });
  }

  try {
    const url = await uploadImageToR2(file, `invitations/${eventId}`);
    return NextResponse.json({ status: "success", url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal upload foto.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }
}

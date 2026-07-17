import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

// BAB 14.2 & 17 — Render QR tiket tamu di halaman undangan PUBLIK (tanpa
// login). Beda dari /api/guests/[id]/qrcode yang dilindungi login (dipakai
// Admin buat download manual) — endpoint ini sengaja publik, tapi tetap
// aman karena `code` di sini adalah `Guest.qrCode` itu sendiri: sebuah UUID
// acak yang cuma diketahui tamu bersangkutan (dikirim lewat link undangan
// pribadinya), bukan ID yang gampang ditebak/diurutkan.
export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const guest = await prisma.guest.findUnique({ where: { qrCode: params.code } });

  if (!guest) {
    return NextResponse.json({ status: "error", message: "QR tidak ditemukan." }, { status: 404 });
  }

  const png = await QRCode.toBuffer(guest.qrCode, {
    type: "png",
    width: 320,
    margin: 2,
    color: { dark: "#1F3D2B", light: "#FFFFFF" },
  });

  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

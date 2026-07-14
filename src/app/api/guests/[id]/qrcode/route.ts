import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// BAB 14.2 — Setiap tamu punya QR unik (Guest.qrCode) yang dicetak/dikirim
// bersama undangan. Endpoint ini merender qrCode tersebut jadi gambar PNG.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const guest = await prisma.guest.findUnique({
    where: { id: params.id },
    include: { event: true },
  });

  if (!guest || guest.event.userId !== session.user.id) {
    return NextResponse.json({ status: "error", message: "Tamu tidak ditemukan." }, { status: 404 });
  }

  const png = await QRCode.toBuffer(guest.qrCode, {
    type: "png",
    width: 320,
    margin: 2,
    color: { dark: "#1F3D2B", light: "#FFFFFF" }, // forest-900 on white, sesuai brand token
  });

  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

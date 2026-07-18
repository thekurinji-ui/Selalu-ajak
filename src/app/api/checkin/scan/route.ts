import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// BAB 14.5 — QR Check-in via pemindaian kamera.
// Menerima `qrCode` (nilai unik dari Guest.qrCode) hasil scan, memvalidasi
// bahwa tamu tersebut memang milik salah satu acara milik user yang login,
// lalu mencatat CheckIn (method: QR). Idempotent — scan berulang untuk tamu
// yang sudah check-in akan mengembalikan status "already".
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const qrCode = typeof body?.qrCode === "string" ? body.qrCode.trim() : "";

  if (!qrCode) {
    return NextResponse.json(
      { status: "error", message: "Kode QR tidak valid." },
      { status: 400 },
    );
  }

  const guest = await prisma.guest.findUnique({
    where: { qrCode },
    include: { checkIn: true, event: true, rsvp: true },
  });

  if (!guest || guest.event.userId !== session.user.id) {
    return NextResponse.json(
      { status: "not_found", message: "Tamu tidak ditemukan untuk QR ini." },
      { status: 404 },
    );
  }

  if (guest.checkIn) {
    return NextResponse.json({
      status: "already",
      message: `${guest.name} sudah check-in sebelumnya.`,
      guest: { id: guest.id, name: guest.name, checkedInAt: guest.checkIn.checkedInAt },
    });
  }

  const checkIn = await prisma.checkIn.create({
    data: { guestId: guest.id, method: "QR" },
  });

  // BAB 20.3 — "Check-in pertama": kirim sekali saja per acara, dicek lewat
  // jumlah CheckIn yang sudah ada untuk acara ini (1 = baru saja jadi yang pertama).
  const checkInCount = await prisma.checkIn.count({ where: { guest: { eventId: guest.eventId } } });
  if (checkInCount === 1) {
    await createNotification({
      userId: guest.event.userId,
      category: "checkin",
      title: "Check-in pertama",
      body: `${guest.name} adalah tamu pertama yang check-in di acara "${guest.event.name}".`,
    });
  }

  return NextResponse.json({
    status: "success",
    message: `${guest.name} berhasil check-in.`,
    guest: {
      id: guest.id,
      name: guest.name,
      companions: guest.companions,
      rsvpStatus: guest.rsvp?.status ?? null,
      checkedInAt: checkIn.checkedInAt,
    },
  });
}

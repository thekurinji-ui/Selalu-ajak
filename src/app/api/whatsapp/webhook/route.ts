import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapFonnteStatus } from "@/lib/whatsapp";

// BAB 13.7 — Webhook status pengiriman (real-time) dari Fonnte.
// Daftarkan URL ini di Fonnte -> Device -> Edit -> Webhook URL:
//   https://{NEXT_PUBLIC_APP_DOMAIN}/api/whatsapp/webhook?secret={WHATSAPP_WEBHOOK_SECRET}
//
// Payload Fonnte (lihat https://docs.fonnte.com/webhook-update-message-status/):
//   { device, id, stateid, status, state, timestamp }
// `id` cocok dengan `providerMessageId` yang kita simpan saat mengirim lewat
// /api/whatsapp/campaigns/[id]/send.
//
// Fonnte mewajibkan webhook membalas HTTP 200 agar tidak dianggap gagal dan
// diulang — jadi rute ini selalu balas 200 kecuali secret tidak cocok.
export async function POST(req: Request) {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  if (secret) {
    const provided = new URL(req.url).searchParams.get("secret");
    if (provided !== secret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  const providerMessageId = body?.id ? String(body.id) : null;
  const rawStatus = typeof body?.status === "string" ? body.status : null;

  if (!providerMessageId || !rawStatus) {
    // Payload tidak dikenali — tetap balas 200 supaya Fonnte tidak retry
    // terus-menerus untuk event yang memang bukan urusan kita.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const mapped = mapFonnteStatus(rawStatus);
  if (!mapped) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const recipient = await prisma.whatsappRecipient.findFirst({
    where: { providerMessageId },
  });

  if (!recipient) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Jangan mundur status: kalau sudah READ, jangan ditimpa balik ke SENT
  // hanya karena event webhook datang tidak berurutan.
  const statusRank: Record<string, number> = { SENT: 1, DELIVERED: 2, READ: 3, FAILED: 1 };
  if (recipient.status !== "PENDING" && statusRank[mapped] < statusRank[recipient.status]) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const now = new Date();
  await prisma.whatsappRecipient.update({
    where: { id: recipient.id },
    data: {
      status: mapped,
      ...(mapped === "DELIVERED" ? { deliveredAt: now } : {}),
      ...(mapped === "READ" ? { readAt: now } : {}),
      ...(mapped === "FAILED" ? { errorReason: "Ditandai gagal oleh Fonnte (webhook status)." } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

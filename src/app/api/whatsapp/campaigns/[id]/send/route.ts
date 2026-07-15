import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSubscription } from "@/lib/subscription";
import { PLANS } from "@/lib/plans";
import { formatDateID } from "@/lib/utils";
import {
  normalizeWhatsappNumber,
  renderWhatsappTemplate,
  sendFonnteMessage,
} from "@/lib/whatsapp";

// BAB 13.6 — Kirim Kampanye
// POST /api/whatsapp/campaigns/[id]/send
//
// Memproses kampanye yang berstatus MENUNGGU: untuk tiap tamu di acara terkait
// yang belum punya WhatsappRecipient di kampanye ini, kirim satu pesan lewat
// Fonnte (dipersonalisasi dari templateText), lalu simpan hasilnya per-tamu.
//
// Catatan: dikirim berurutan (bukan Promise.all) dengan jeda kecil supaya
// tidak membanjiri device Fonnte / kena rate limit. Untuk daftar tamu yang
// sangat besar, endpoint ini bisa mendekati batas durasi function di Vercel —
// lihat `maxDuration` di bawah. Kalau nanti volumenya sudah besar, langkah
// selanjutnya adalah memindahkan proses ini ke queue/background job.
export const maxDuration = 60;

const SEND_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaign = await prisma.whatsappCampaign.findUnique({
    where: { id: params.id },
    include: { event: true },
  });

  if (!campaign || campaign.event.userId !== session.user.id) {
    return NextResponse.json({ error: "Kampanye tidak ditemukan." }, { status: 404 });
  }

  if (campaign.status !== "MENUNGGU") {
    return NextResponse.json(
      { error: "Kampanye ini sudah pernah diproses." },
      { status: 409 },
    );
  }

  const subscription = await getOrCreateSubscription(session.user.id);
  if (!PLANS[subscription.plan].whatsappBlast) {
    return NextResponse.json(
      {
        error:
          "WhatsApp Blast tidak tersedia di paket Anda saat ini. Upgrade ke Premium atau Ultimate untuk mengirim kampanye.",
      },
      { status: 403 },
    );
  }

  if (!process.env.WHATSAPP_API_TOKEN) {
    return NextResponse.json(
      { error: "WHATSAPP_API_TOKEN belum diatur di server. Hubungi admin." },
      { status: 503 },
    );
  }

  const guests = await prisma.guest.findMany({ where: { eventId: campaign.eventId } });

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://selaluajak.kurinji.asia").replace(/\/$/, "");
  const linkUndangan = `${appUrl}/i/${campaign.event.slug}`;

  await prisma.whatsappCampaign.update({
    where: { id: campaign.id },
    data: { status: "DIPROSES", recipientCount: guests.length },
  });

  let successCount = 0;
  let failedCount = 0;

  for (const guest of guests) {
    const phone = normalizeWhatsappNumber(guest.whatsapp);
    const renderedMessage = renderWhatsappTemplate(campaign.templateText, {
      namaTamu: guest.name,
      namaAcara: campaign.event.name,
      tanggalAcara: campaign.event.date ? formatDateID(campaign.event.date) : undefined,
      lokasiAcara: campaign.event.location ?? undefined,
      linkUndangan: `${linkUndangan}?to=${encodeURIComponent(guest.name)}`,
    });

    if (!phone) {
      failedCount += 1;
      await prisma.whatsappRecipient.upsert({
        where: { campaignId_guestId: { campaignId: campaign.id, guestId: guest.id } },
        create: {
          campaignId: campaign.id,
          guestId: guest.id,
          phone: guest.whatsapp,
          renderedMessage,
          status: "FAILED",
          errorReason: "Nomor WhatsApp tidak valid.",
        },
        update: { status: "FAILED", errorReason: "Nomor WhatsApp tidak valid." },
      });
      continue;
    }

    const result = await sendFonnteMessage({ to: phone, message: renderedMessage });

    if (result.ok) {
      successCount += 1;
      await prisma.whatsappRecipient.upsert({
        where: { campaignId_guestId: { campaignId: campaign.id, guestId: guest.id } },
        create: {
          campaignId: campaign.id,
          guestId: guest.id,
          phone,
          renderedMessage,
          status: "SENT",
          providerMessageId: result.providerMessageId,
          sentAt: new Date(),
        },
        update: {
          status: "SENT",
          providerMessageId: result.providerMessageId,
          sentAt: new Date(),
          errorReason: null,
        },
      });
      await prisma.guest.update({ where: { id: guest.id }, data: { invitationSent: true } });
    } else {
      failedCount += 1;
      await prisma.whatsappRecipient.upsert({
        where: { campaignId_guestId: { campaignId: campaign.id, guestId: guest.id } },
        create: {
          campaignId: campaign.id,
          guestId: guest.id,
          phone,
          renderedMessage,
          status: "FAILED",
          errorReason: result.reason,
        },
        update: { status: "FAILED", errorReason: result.reason },
      });
    }

    // Jeda kecil antar pengiriman — sopan ke rate limit Fonnte & bikin pola
    // pengiriman terlihat lebih manusiawi (mengurangi risiko nomor diblokir).
    await sleep(SEND_DELAY_MS);
  }

  const finalStatus = successCount > 0 ? "TERKIRIM" : "GAGAL";

  const updated = await prisma.whatsappCampaign.update({
    where: { id: campaign.id },
    data: { status: finalStatus, successCount, failedCount },
  });

  await prisma.auditLog
    .create({
      data: {
        userId: session.user.id,
        eventId: campaign.eventId,
        action: "WHATSAPP_CAMPAIGN_SENT",
        metadata: { campaignId: campaign.id, successCount, failedCount },
      },
    })
    .catch(() => {
      // Audit log best-effort, tidak boleh menggagalkan response.
    });

  return NextResponse.json({
    ok: true,
    status: updated.status,
    successCount,
    failedCount,
    total: guests.length,
  });
    }

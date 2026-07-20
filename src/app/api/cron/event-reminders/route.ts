import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { formatDateID } from "@/lib/utils";
import { normalizeWhatsappNumber, sendFonnteMessage } from "@/lib/whatsapp";

// BAB 20.9 — Reminder otomatis H-30/H-7/H-1
// GET /api/cron/event-reminders
//
// Dipanggil 1x/hari oleh Vercel Cron (lihat vercel.json). Untuk tiap acara
// PUBLISHED yang tanggalnya jatuh tepat 30/7/1 hari dari sekarang, kirim
// pengingat WhatsApp ke PEMILIK acara (bukan tamu — beda dari WhatsApp
// Blast BAB 13) lewat device Fonnte yang sama, plus notifikasi in-app.
//
// Idempotent: tiap kombinasi (eventId, milestone) yang berhasil dikirim
// dicatat di EventReminderLog dan tidak akan dikirim ulang meski cron ini
// terpanggil lagi di hari yang sama (retry, double-trigger, dsb).
//
// Catatan zona waktu: perbandingan tanggal di bawah dilakukan berbasis hari
// kalender UTC dari kolom `Event.date`. Event.timezone (per-acara) belum
// dipakai di sini — cukup akurat untuk reminder H-30/H-7/H-1 karena
// toleransinya harian, bukan per-jam.
export const maxDuration = 60;

const MILESTONES = [30, 7, 1] as const;
const SEND_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Batas awal & akhir (UTC) untuk hari kalender yang sama dengan `date`.
function dayRangeUTC(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function addDaysUTC(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function buildReminderMessage(milestone: number, eventName: string, eventDate: Date, appUrl: string) {
  const label = milestone === 30 ? "1 bulan lagi" : milestone === 7 ? "1 minggu lagi" : "besok";
  return (
    `Halo! 👋 Acara *${eventName}* tinggal *${label}* ` +
    `(${formatDateID(eventDate)}).\n\n` +
    `Yuk cek persiapan & undanganmu di dashboard Selalu Ajak:\n${appUrl}/dashboard`
  );
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://selaluajak.kurinji.asia").replace(/\/$/, "");
  const today = new Date();

  const results: Array<{ milestone: number; eventId: string; ok: boolean; reason?: string }> = [];

  // Fonnte belum dikonfigurasi — reminder WhatsApp di-skip, tapi tetap lanjut
  // biar notifikasi in-app-nya jalan (lebih baik separuh reminder terkirim
  // daripada semuanya gagal diam-diam).
  const whatsappConfigured = Boolean(process.env.WHATSAPP_API_TOKEN);

  for (const milestone of MILESTONES) {
    const targetDate = addDaysUTC(today, milestone);
    const { start, end } = dayRangeUTC(targetDate);

    const events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        date: { gte: start, lt: end },
        reminderLogs: { none: { milestone } },
      },
      include: { user: true },
    });

    for (const event of events) {
      if (!event.date) continue; // dijaga oleh query di atas, cuma buat TypeScript

      let whatsappOk = false;
      let whatsappReason: string | undefined;

      if (whatsappConfigured && event.user.whatsappNumber) {
        const phone = normalizeWhatsappNumber(event.user.whatsappNumber);
        if (phone) {
          const message = buildReminderMessage(milestone, event.name, event.date, appUrl);
          const result = await sendFonnteMessage({ to: phone, message });
          whatsappOk = result.ok;
          if (!result.ok) whatsappReason = result.reason;
          await sleep(SEND_DELAY_MS);
        } else {
          whatsappReason = "Nomor WhatsApp pemilik acara tidak valid.";
        }
      } else if (!whatsappConfigured) {
        whatsappReason = "WHATSAPP_API_TOKEN belum diatur di server.";
      } else {
        whatsappReason = "Pemilik acara belum mengisi nomor WhatsApp.";
      }

      const label = milestone === 30 ? "1 bulan" : milestone === 7 ? "1 minggu" : "1 hari";
      await createNotification({
        userId: event.userId,
        category: "event",
        title: `Acara "${event.name}" tinggal ${label} lagi`,
        body: `Jangan lupa cek persiapan acaramu — tanggal ${formatDateID(event.date)} sudah dekat.`,
      });

      // Dicatat sebagai "sudah dikirim" walau WhatsApp gagal (mis. nomor
      // kosong), karena notifikasi in-app-nya tetap sudah dibuat dan kita
      // tidak mau retry milestone yang sama berkali-kali tiap hari — cukup
      // sekali per milestone, sama seperti pola idempotent WhatsApp Blast.
      await prisma.eventReminderLog.create({
        data: { eventId: event.id, milestone },
      });

      results.push({ milestone, eventId: event.id, ok: whatsappOk, reason: whatsappReason });
    }
  }

  return NextResponse.json({
    ok: true,
    checkedAt: today.toISOString(),
    totalProcessed: results.length,
    results,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature, mapMidtransStatus } from "@/lib/midtrans";
import { createNotification } from "@/lib/notifications";
import { PLANS } from "@/lib/plans";

// BAB 18.6 — Webhook notifikasi pembayaran dari Midtrans (Snap).
// Daftarkan URL ini di Midtrans Dashboard -> Settings -> Configuration ->
// Payment Notification URL:
//   https://{NEXT_PUBLIC_APP_DOMAIN}/api/billing/webhook
//
// Payload Midtrans (lihat https://docs.midtrans.com/docs/https-notification-webhooks):
//   { order_id, status_code, gross_amount, signature_key, transaction_status,
//     fraud_status, payment_type, ... }
//
// Midtrans akan retry notifikasi kalau tidak dibalas 2xx, jadi rute ini balas
// 200 untuk payload yang valid meskipun order_id-nya tidak kita kenali (mis.
// notifikasi test dari Dashboard).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const orderId = typeof body.order_id === "string" ? body.order_id : null;
  const statusCode = typeof body.status_code === "string" ? body.status_code : null;
  const grossAmount = typeof body.gross_amount === "string" ? body.gross_amount : null;
  const signatureKey = typeof body.signature_key === "string" ? body.signature_key : null;
  const transactionStatus = typeof body.transaction_status === "string" ? body.transaction_status : null;
  const fraudStatus = typeof body.fraud_status === "string" ? body.fraud_status : null;
  const paymentType = typeof body.payment_type === "string" ? body.payment_type : null;

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
    return NextResponse.json({ error: "Field notifikasi tidak lengkap." }, { status: 400 });
  }

  const validSignature = verifyMidtransSignature({ orderId, statusCode, grossAmount, signatureKey });
  if (!validSignature) {
    return NextResponse.json({ error: "Signature tidak valid." }, { status: 403 });
  }

  const invoice = await prisma.invoice.findFirst({ where: { midtransOrderId: orderId } });
  if (!invoice) {
    // order_id tidak dikenal (mis. notifikasi test) — tetap balas 200 supaya
    // Midtrans tidak retry terus-menerus untuk sesuatu yang bukan urusan kita.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Jangan proses ulang invoice yang statusnya sudah final — mis. notifikasi
  // duplikat dari Midtrans, atau notifikasi "pending" yang datang belakangan
  // setelah invoice sudah PAID.
  if (invoice.status !== "PENDING") {
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const mapped = mapMidtransStatus(transactionStatus, fraudStatus);
  if (!mapped) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (mapped === "PAID") {
    const subscription = await prisma.subscription.findUnique({ where: { userId: invoice.userId } });
    if (!subscription) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paymentMethod: paymentType ?? invoice.paymentMethod },
      }),
      prisma.subscription.update({
        where: { userId: invoice.userId },
        data: {
          plan: invoice.plan,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: newEndDate,
        },
      }),
    ]);

    await createNotification({
      userId: invoice.userId,
      category: "subscription",
      title: "Pembayaran berhasil",
      body: `Pembayaran paket ${PLANS[invoice.plan].label} berhasil. Langganan Anda aktif hingga ${newEndDate.toLocaleDateString("id-ID")}.`,
    });
  } else if (mapped === "PENDING") {
    // Tidak perlu update apa-apa, invoice memang sudah PENDING.
  } else {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: mapped, paymentMethod: paymentType ?? invoice.paymentMethod },
    });

    await createNotification({
      userId: invoice.userId,
      category: "subscription",
      title: "Pembayaran gagal",
      body: `Pembayaran untuk paket ${PLANS[invoice.plan].label} tidak berhasil (${mapped}). Silakan coba lagi dari halaman Billing.`,
    });
  }

  return NextResponse.json({ ok: true });
}

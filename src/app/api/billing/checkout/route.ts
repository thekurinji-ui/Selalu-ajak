import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { createSnapTransaction, isMidtransConfigured } from "@/lib/midtrans";

// BAB 18.6 — Dipanggil dari tombol "Bayar Sekarang" di halaman Billing
// (lihat PayInvoiceButton) untuk membuat transaksi Midtrans Snap atas invoice
// PENDING milik user yang sedang login, lalu mengembalikan Snap `token` untuk
// dibuka lewat snap.js (window.snap.pay) di browser.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Kamu harus login dulu." }, { status: 401 });
  }

  if (!isMidtransConfigured()) {
    return NextResponse.json(
      { error: "Payment gateway belum dikonfigurasi (MIDTRANS_SERVER_KEY kosong)." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const invoiceId = typeof body?.invoiceId === "string" ? body.invoiceId : null;
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId wajib diisi." }, { status: 400 });
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: session.user.id, status: "PENDING" },
  });
  if (!invoice) {
    return NextResponse.json(
      { error: "Invoice tidak ditemukan atau sudah tidak berstatus pending." },
      { status: 404 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
  }

  // order_id baru per percobaan bayar (bukan invoice.id langsung), supaya
  // kalau Snap popup ditutup tanpa bayar, invoice yang sama masih bisa dicoba
  // ulang tanpa bentrok — Midtrans menolak order_id yang dipakai ulang.
  const orderId = `${invoice.id}-${Date.now()}`;

  const result = await createSnapTransaction({
    orderId,
    grossAmount: invoice.amount,
    customerName: user.name,
    customerEmail: user.email,
    itemName: `Langganan ${PLANS[invoice.plan].label} - Selalu Ajak`,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 502 });
  }

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { midtransOrderId: orderId },
  });

  return NextResponse.json({ token: result.token, redirectUrl: result.redirectUrl });
}

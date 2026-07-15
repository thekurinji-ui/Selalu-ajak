import crypto from "crypto";

// BAB 18.6 — Integrasi Payment Gateway Midtrans (Snap).
// Dokumentasi: https://docs.midtrans.com/docs/snap-integration-guide
//
// Env yang dipakai (lihat .env.example):
//   MIDTRANS_SERVER_KEY              -> Server Key (Settings -> Access Keys di
//                                        Midtrans Dashboard). RAHASIA, hanya dipakai di server.
//   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY  -> Client Key, aman diekspos ke browser
//                                        karena dipakai snap.js untuk render popup.
//   MIDTRANS_IS_PRODUCTION           -> "true" untuk akun Production, selain itu
//                                        dianggap Sandbox.
//   APP_URL                          -> Base URL domain web ini sendiri (mis.
//                                        https://selaluajak.kurinji.asia). Dipakai
//                                        untuk X-Override-Notification supaya kalau
//                                        1 akun Midtrans dipakai bareng beberapa
//                                        subdomain/web Kurinji, notifikasi tetap
//                                        terkirim ke webhook web yang benar, bukan
//                                        ke Notification URL default di dashboard.

const SNAP_TRANSACTION_URL = {
  sandbox: "https://app.sandbox.midtrans.com/snap/v1/transactions",
  production: "https://app.midtrans.com/snap/v1/transactions",
};

const SNAP_JS_URL = {
  sandbox: "https://app.sandbox.midtrans.com/snap/snap.js",
  production: "https://app.midtrans.com/snap/snap.js",
};

export function isMidtransConfigured(): boolean {
  return Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

// URL script snap.js yang perlu dimuat di browser sebelum memanggil
// `window.snap.pay(token)`. Sandbox dan Production pakai domain berbeda,
// jangan sampai tertukar (transaksi sandbox tidak akan muncul di production
// dashboard, begitu juga sebaliknya).
export function midtransSnapJsUrl(): string {
  return isMidtransProduction() ? SNAP_JS_URL.production : SNAP_JS_URL.sandbox;
}

// URL webhook milik web INI SENDIRI (bukan web Kurinji lain). Dikirim sebagai
// X-Override-Notification supaya kalau 1 akun Midtrans dipakai bareng oleh
// beberapa subdomain (selaluajak.kurinji.asia, kenang.kurinji.asia,
// music.kurinji.asia), setiap transaksi tetap kirim notifikasi ke webhook
// web yang benar-benar membuat transaksi itu, bukan ke default dashboard.
export function ownWebhookUrl(): string | null {
  const base = process.env.APP_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/api/billing/webhook`;
}

export type CreateSnapTransactionParams = {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
};

export type CreateSnapTransactionResult =
  | { ok: true; token: string; redirectUrl: string }
  | { ok: false; reason: string };

/**
 * Buat transaksi baru di Midtrans Snap dan dapatkan `token` untuk dibuka
 * lewat popup snap.js di browser (atau `redirectUrl` sebagai fallback kalau
 * snap.js gagal dimuat).
 */
export async function createSnapTransaction(
  params: CreateSnapTransactionParams,
): Promise<CreateSnapTransactionResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return { ok: false, reason: "MIDTRANS_SERVER_KEY belum diatur di environment." };
  }

  const url = isMidtransProduction() ? SNAP_TRANSACTION_URL.production : SNAP_TRANSACTION_URL.sandbox;
  // Midtrans pakai Basic Auth dengan format base64("server_key:") — tanpa password.
  const auth = Buffer.from(`${serverKey}:`).toString("base64");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
  // Kalau APP_URL diisi, override notification URL supaya notifikasi transaksi
  // ini pasti balik ke webhook web ini sendiri — penting kalau 1 akun Midtrans
  // dipakai bareng beberapa subdomain Kurinji.
  const overrideUrl = ownWebhookUrl();
  if (overrideUrl) {
    headers["X-Override-Notification"] = overrideUrl;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        transaction_details: {
          order_id: params.orderId,
          gross_amount: params.grossAmount,
        },
        credit_card: { secure: true },
        customer_details: {
          first_name: params.customerName,
          email: params.customerEmail,
        },
        item_details: [
          {
            id: "subscription",
            price: params.grossAmount,
            quantity: 1,
            // Midtrans membatasi panjang nama item, potong supaya tidak ditolak.
            name: params.itemName.slice(0, 50),
          },
        ],
      }),
    });
  } catch (err) {
    return {
      ok: false,
      reason:
        err instanceof Error ? `Gagal menghubungi Midtrans: ${err.message}` : "Gagal menghubungi Midtrans.",
    };
  }

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.token) {
    const reason =
      Array.isArray(json?.error_messages) && typeof json.error_messages[0] === "string"
        ? json.error_messages[0]
        : `HTTP ${response.status}`;
    return { ok: false, reason };
  }

  return { ok: true, token: json.token, redirectUrl: json.redirect_url };
}

/**
 * Verifikasi signature notifikasi webhook Midtrans supaya kita yakin
 * request-nya benar-benar dari Midtrans, bukan orang lain yang menebak
 * endpoint webhook kita. Lihat:
 * https://docs.midtrans.com/docs/https-notification-webhooks
 *
 *   signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return false;

  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === params.signatureKey;
}

export type MappedInvoiceStatus = "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "REFUNDED";

/**
 * Map `transaction_status` (+ `fraud_status` khusus kartu kredit) dari
 * notifikasi Midtrans ke InvoiceStatus kita. Referensi status di
 * https://docs.midtrans.com/docs/https-notification-webhooks#transaction-status
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus: string | null,
): MappedInvoiceStatus | null {
  switch (transactionStatus) {
    case "capture":
      // Khusus kartu kredit: perlu dicek fraud_status dari Fraud Detection System.
      if (fraudStatus === "accept") return "PAID";
      if (fraudStatus === "challenge") return "PENDING";
      return "FAILED";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    case "refund":
    case "partial_refund":
      return "REFUNDED";
    default:
      return null;
  }
}

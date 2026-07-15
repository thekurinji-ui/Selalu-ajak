// BAB 13 — WhatsApp Blast, terhubung ke Fonnte (https://docs.fonnte.com).
//
// Fonnte adalah WhatsApp gateway non-resmi yang populer dipakai di Indonesia:
// tidak perlu approval template seperti Meta WhatsApp Cloud API, cukup satu
// device token dan bisa langsung kirim pesan teks bebas.
//
// Env yang dipakai (lihat .env.example):
//   WHATSAPP_API_URL   -> endpoint kirim pesan Fonnte, default https://api.fonnte.com/send
//   WHATSAPP_API_TOKEN -> device token dari dashboard Fonnte (Device -> lihat Token)

const DEFAULT_FONNTE_SEND_URL = "https://api.fonnte.com/send";

export type FonnteSendResult =
  | { ok: true; providerMessageId: string | null; raw: unknown }
  | { ok: false; reason: string; raw: unknown };

/**
 * Ubah nomor WhatsApp ke format Fonnte yang aman: full country code, tanpa
 * spasi/simbol. "081234567890" -> "6281234567890", "+62812..." -> "62812...".
 * Sengaja tidak mengandalkan parameter `countryCode` bawaan Fonnte supaya
 * perilakunya konsisten dan mudah diprediksi/di-test.
 */
export function normalizeWhatsappNumber(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;

  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  // Nomor tanpa awalan 0/62 (jarang, tapi mungkin diketik manual) — asumsikan
  // sudah nasional Indonesia dan tambahkan 62 di depan.
  return `62${digits}`;
}

export type WhatsappTemplateVars = {
  namaTamu: string;
  namaAcara: string;
  tanggalAcara?: string;
  lokasiAcara?: string;
  linkUndangan: string;
};

// BAB 13.4 — variabel template yang tersedia di kolom "Template Pesan" pada
// WhatsApp Blast: {{nama_tamu}}, {{nama_acara}}, {{tanggal_acara}},
// {{lokasi_acara}}, {{link_undangan}}.
export function renderWhatsappTemplate(template: string, vars: WhatsappTemplateVars): string {
  return template
    .replaceAll("{{nama_tamu}}", vars.namaTamu)
    .replaceAll("{{nama_acara}}", vars.namaAcara)
    .replaceAll("{{tanggal_acara}}", vars.tanggalAcara ?? "-")
    .replaceAll("{{lokasi_acara}}", vars.lokasiAcara ?? "-")
    .replaceAll("{{link_undangan}}", vars.linkUndangan);
}

/**
 * Kirim satu pesan WhatsApp lewat Fonnte. Dipanggil sekali per penerima
 * (bukan batch) supaya tiap pesan bisa dipersonalisasi penuh dan hasil
 * kirim/gagalnya bisa dilacak per-tamu di WhatsappRecipient.
 */
export async function sendFonnteMessage(params: {
  to: string; // nomor yang sudah dinormalisasi, mis. "6281234567890"
  message: string;
}): Promise<FonnteSendResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const url = process.env.WHATSAPP_API_URL || DEFAULT_FONNTE_SEND_URL;

  if (!token) {
    return { ok: false, reason: "WHATSAPP_API_TOKEN belum diatur di environment.", raw: null };
  }

  const form = new FormData();
  form.append("target", params.to);
  form.append("message", params.message);
  // Nomor sudah dinormalisasi ke 62xxxx sendiri di normalizeWhatsappNumber,
  // jadi minta Fonnte tidak mengubah-ubah lagi.
  form.append("countryCode", "0");
  form.append("typing", "true");

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { Authorization: token },
      body: form,
    });
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? `Gagal menghubungi Fonnte: ${err.message}` : "Gagal menghubungi Fonnte.",
      raw: null,
    };
  }

  const json = await response.json().catch(() => null);

  // Fonnte selalu balas 200 walau status:false (mis. token invalid, kuota
  // habis), jadi cek field `status` di body, bukan hanya response.ok.
  const status = json?.status ?? json?.Status; // Fonnte kadang membalas "Status" (huruf besar) untuk token invalid
  if (!response.ok || status !== true) {
    const reason = typeof json?.reason === "string" ? json.reason : `HTTP ${response.status}`;
    return { ok: false, reason, raw: json };
  }

  const providerMessageId = Array.isArray(json?.id) && json.id.length > 0 ? String(json.id[0]) : null;
  return { ok: true, providerMessageId, raw: json };
}

// Mapping status webhook Fonnte -> RecipientStatus kita (lihat
// https://docs.fonnte.com/webhook-update-message-status/). Fonnte mengirim
// field `status` bertahap: "sent" -> "delivered" -> "read", atau "failed".
export function mapFonnteStatus(fonnteStatus: string): "SENT" | "DELIVERED" | "READ" | "FAILED" | null {
  const normalized = fonnteStatus.toLowerCase();
  if (normalized.includes("read")) return "READ";
  if (normalized.includes("deliver")) return "DELIVERED";
  if (normalized.includes("fail") || normalized.includes("error")) return "FAILED";
  if (normalized.includes("sent") || normalized.includes("success")) return "SENT";
  return null;
}

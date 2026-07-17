// BAB 19.5 & 20.8 — Pengiriman email transaksional (reset password, dst).
// Pakai Resend (https://resend.com) — cukup 1 API key, tidak perlu setup
// SMTP server sendiri. Mengikuti pola yang sama dengan `midtrans.ts`:
// fitur aktif otomatis begitu `RESEND_API_KEY` terisi, dan punya fallback
// yang jelas kalau belum dikonfigurasi (dev lokal), bukan diam-diam gagal.

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

const DEFAULT_FROM = "Selalu Ajak <noreply@selaluajak.kurinji.asia>";

export type SendEmailResult = { ok: true } | { ok: false; reason: string };

async function sendEmail(params: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "RESEND_API_KEY belum diatur di environment." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { ok: false, reason: `Resend HTTP ${response.status}: ${body}` };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? `Gagal menghubungi Resend: ${err.message}` : "Gagal menghubungi Resend.",
    };
  }
}

// BAB 19.5 — Lupa Password: kirim link reset yang berlaku 1 jam.
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Reset Password — Selalu Ajak",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #14532d;">Reset Password Selalu Ajak</h2>
        <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">Link ini berlaku selama 1 jam. Kalau Anda tidak meminta reset password, abaikan saja email ini — password Anda tidak akan berubah.</p>
        <p style="font-size: 13px; color: #6b7280;">Atau salin tautan ini ke browser Anda:<br/>${resetUrl}</p>
      </div>
    `,
  });
}

// BAB 19.10 — notifikasi keamanan akun (ganti password/email).
export async function sendAccountChangeEmail(to: string, message: string): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Aktivitas Akun — Selalu Ajak",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #14532d;">Aktivitas Akun</h2>
        <p>${message}</p>
        <p style="font-size: 13px; color: #6b7280;">Kalau ini bukan Anda, segera hubungi tim Selalu Ajak.</p>
      </div>
    `,
  });
}

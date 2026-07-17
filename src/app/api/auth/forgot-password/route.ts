import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";

// BAB 19.5 — Lupa Password
// POST /api/auth/forgot-password
//
// Selalu balas dengan pesan generik yang sama baik email-nya terdaftar atau
// tidak (mencegah "user enumeration" — orang luar menebak email mana saja
// yang punya akun di Selalu Ajak lewat pesan error yang beda-beda).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ status: "error", message: "Email tidak valid." }, { status: 400 });
  }

  const { email } = parsed.data;
  const genericResponse = {
    status: "success" as const,
    message: "Kalau email tersebut terdaftar, kami sudah mengirim link reset password.",
  };

  const user = await prisma.user.findUnique({ where: { email } });

  // User login via Google tanpa password (passwordHash null) tidak punya
  // password untuk direset — tetap balas generik, jangan bocorkan itu juga.
  if (!user || !user.passwordHash) {
    return NextResponse.json(genericResponse);
  }

  // Hapus token lama untuk email ini dulu supaya cuma 1 link reset yang
  // aktif setiap saat.
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token = randomUUID();
  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }, // 1 jam
  });

  const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://selaluajak.kurinji.asia").replace(/\/$/, "");
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  if (!isEmailConfigured()) {
    // Dev fallback: belum ada RESEND_API_KEY di environment ini. Daripada
    // gagal senyap, kembalikan link resetnya langsung di response supaya
    // alur tetap bisa dites tanpa akun email sungguhan — jangan pernah
    // aktif kalau RESEND_API_KEY sudah diisi (lihat isEmailConfigured()).
    return NextResponse.json({
      ...genericResponse,
      devResetUrl: resetUrl,
      devNote: "RESEND_API_KEY belum diatur di server — ini mode development, link di atas tidak dikirim lewat email sungguhan.",
    });
  }

  const result = await sendPasswordResetEmail(email, resetUrl);
  if (!result.ok) {
    // Tetap balas generik ke user (jangan bocorkan detail error internal),
    // tapi log di server supaya admin tahu ada kegagalan kirim email.
    console.error("Gagal mengirim email reset password:", result.reason);
  }

  return NextResponse.json(genericResponse);
}

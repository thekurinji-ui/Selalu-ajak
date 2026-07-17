import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

// BAB 19.5 — Lupa Password: konfirmasi token & set password baru.
// POST /api/auth/reset-password
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Data tidak valid.";
    return NextResponse.json({ status: "error", message }, { status: 400 });
  }

  const { token, newPassword } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { status: "error", message: "Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link baru." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return NextResponse.json({ status: "error", message: "Akun tidak ditemukan." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    // Token sekali pakai — hapus token ini dan token lain milik email yang
    // sama supaya link lama tidak bisa dipakai ulang.
    prisma.passwordResetToken.deleteMany({ where: { email: resetToken.email } }),
    prisma.auditLog.create({
      data: { userId: user.id, action: "PASSWORD_RESET_COMPLETED", metadata: {} },
    }),
  ]);

  return NextResponse.json({ status: "success", message: "Password berhasil diubah. Silakan login dengan password baru." });
}

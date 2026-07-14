import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

// BAB 7.4 — Register: Nama Lengkap, Email, Password.
// Setelah berhasil: akun dibuat, (email verifikasi disiapkan untuk fase berikutnya).
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: "Data tidak valid", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { status: "error", message: "Email sudah terdaftar." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return NextResponse.json({
    status: "success",
    message: "Akun berhasil dibuat.",
    data: { id: user.id, email: user.email },
  });
}

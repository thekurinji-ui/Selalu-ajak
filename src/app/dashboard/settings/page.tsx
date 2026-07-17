import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  profileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
} from "@/lib/validation";
import { isEmailConfigured, sendAccountChangeEmail } from "@/lib/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 19 — Account & User Management
//
// Halaman ini menggantikan stub lama ("menyusul di Phase 2") dengan 3 blok
// nyata: Profil (19.6), Keamanan (19.7-19.8 — ganti password & email), dan
// Hapus Akun (19.13). Session management per-perangkat (19.9) belum ada di
// sini — lihat catatan di README, butuh mekanisme tambahan karena NextAuth
// di project ini pakai strategy "jwt" (stateless), bukan session di database.

async function updateProfile(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    whatsappNumber: formData.get("whatsappNumber") || undefined,
    city: formData.get("city") || undefined,
    language: formData.get("language"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) redirect("/dashboard/settings?error=profile");

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "PROFILE_UPDATED", metadata: {} },
  });

  redirect("/dashboard/settings?success=profile");
}

async function changePassword(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(parsed.error.errors[0]?.message ?? "password")}`);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    // Akun ini login lewat Google, tidak punya password credential untuk diganti.
    redirect("/dashboard/settings?error=Akun+ini+masuk+lewat+Google%2C+tidak+ada+password+untuk+diganti.");
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/dashboard/settings?error=Password+saat+ini+salah.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "PASSWORD_CHANGED", metadata: {} },
  });

  if (isEmailConfigured()) {
    await sendAccountChangeEmail(
      user.email,
      "Password akun Selalu Ajak Anda baru saja diubah.",
    ).catch(() => {
      // Notifikasi email best-effort — kegagalan kirim tidak boleh menggagalkan proses ganti password.
    });
  }

  redirect("/dashboard/settings?success=password");
}

async function changeEmail(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = changeEmailSchema.safeParse({
    newEmail: formData.get("newEmail"),
    currentPassword: formData.get("currentPasswordForEmail"),
  });
  if (!parsed.success) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(parsed.error.errors[0]?.message ?? "email")}`);
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    redirect("/dashboard/settings?error=Akun+ini+masuk+lewat+Google%2C+tidak+bisa+ganti+email+di+sini.");
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/dashboard/settings?error=Password+salah.");
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.newEmail } });
  if (existing && existing.id !== user.id) {
    redirect("/dashboard/settings?error=Email+sudah+dipakai+akun+lain.");
  }

  const oldEmail = user.email;
  await prisma.user.update({ where: { id: user.id }, data: { email: parsed.data.newEmail } });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "EMAIL_CHANGED", metadata: { from: oldEmail, to: parsed.data.newEmail } },
  });

  if (isEmailConfigured()) {
    await sendAccountChangeEmail(
      oldEmail,
      `Email akun Selalu Ajak Anda diubah dari ${oldEmail} ke ${parsed.data.newEmail}.`,
    ).catch(() => {});
  }

  redirect("/dashboard/settings?success=email");
}

async function deleteAccount(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = deleteAccountSchema.safeParse({ confirmation: formData.get("confirmation") });
  if (!parsed.success) {
    redirect("/dashboard/settings?error=Ketik+HAPUS+untuk+konfirmasi+penghapusan+akun.");
  }

  // BAB 19.13 — penghapusan akun permanen. Event, Guest, dsb ikut terhapus
  // lewat relasi onDelete: Cascade di schema.prisma (lihat model Event).
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "ACCOUNT_DELETED", metadata: {} },
  });
  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirect: false });
  redirect("/");
}

const LANGUAGE_LABEL: Record<string, string> = { id: "Bahasa Indonesia", en: "English" };
const TIMEZONE_OPTIONS = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isGoogleAccount = !user.passwordHash;

  const SUCCESS_MESSAGE: Record<string, string> = {
    profile: "Profil berhasil diperbarui.",
    password: "Password berhasil diubah.",
    email: "Email berhasil diubah.",
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-forest-700">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola profil, keamanan, dan akun Selalu Ajak Anda.</p>
      </div>

      {searchParams.success && SUCCESS_MESSAGE[searchParams.success] && (
        <div className="rounded-md border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
          {SUCCESS_MESSAGE[searchParams.success]}
        </div>
      )}
      {searchParams.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}

      {/* BAB 19.6 — Profil Pengguna */}
      <section className="rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-forest-700">Profil</h2>
        <form action={updateProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <Input name="name" required defaultValue={user.name} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
            <Input name="whatsappNumber" defaultValue={user.whatsappNumber ?? ""} placeholder="08123456789" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Kota</label>
            <Input name="city" defaultValue={user.city ?? ""} placeholder="Jakarta" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Bahasa</label>
            <select
              name="language"
              defaultValue={user.language}
              className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            >
              {Object.entries(LANGUAGE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Zona Waktu</label>
            <select
              name="timezone"
              defaultValue={user.timezone}
              className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Simpan Profil</Button>
          </div>
        </form>
      </section>

      {/* BAB 19.7 & 19.8 — Keamanan */}
      <section className="rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
        <h2 className="font-heading text-lg font-semibold text-forest-700">Keamanan</h2>

        {isGoogleAccount ? (
          <p className="mt-3 text-sm text-slate-500">
            Akun ini masuk lewat <strong>Google Sign-In</strong> — tidak ada password Selalu Ajak yang perlu
            dikelola di sini. Kelola keamanan akun Google Anda langsung lewat akun Google Anda.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Ganti Password</p>
              <form action={changePassword} className="grid gap-3 sm:grid-cols-3">
                <Input type="password" name="currentPassword" required placeholder="Password saat ini" />
                <Input type="password" name="newPassword" required minLength={8} placeholder="Password baru" />
                <Input type="password" name="confirmPassword" required minLength={8} placeholder="Konfirmasi password baru" />
                <div className="sm:col-span-3">
                  <Button type="submit" variant="ghost">
                    Ubah Password
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-6 border-t border-champagne-50 pt-6">
              <p className="mb-2 text-sm font-medium text-slate-700">Ganti Email</p>
              <p className="mb-2 text-xs text-slate-500">Email saat ini: {user.email}</p>
              <form action={changeEmail} className="grid gap-3 sm:grid-cols-3">
                <Input type="email" name="newEmail" required placeholder="Email baru" />
                <Input type="password" name="currentPasswordForEmail" required placeholder="Password (konfirmasi)" />
                <div>
                  <Button type="submit" variant="ghost" className="w-full">
                    Ubah Email
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </section>

      {/* BAB 19.13 — Hapus Akun */}
      <section className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="font-heading text-lg font-semibold text-red-700">Hapus Akun</h2>
        <p className="mt-2 text-sm text-red-700">
          Tindakan ini <strong>permanen</strong> — seluruh acara, tamu, undangan, dan data lain milik akun ini
          akan ikut terhapus dan tidak bisa dikembalikan. Ketik <strong>HAPUS</strong> di kolom bawah untuk
          konfirmasi.
        </p>
        <form action={deleteAccount} className="mt-4 flex flex-wrap gap-3">
          <Input name="confirmation" placeholder="Ketik HAPUS" className="max-w-[200px]" />
          <Button type="submit" variant="ghost" className="border border-red-300 text-red-700 hover:bg-red-100">
            Hapus Akun Saya Permanen
          </Button>
        </form>
      </section>
    </div>
  );
  }

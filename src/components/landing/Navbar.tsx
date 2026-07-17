import { auth } from "@/lib/auth";
import { NavbarClient } from "@/components/landing/NavbarClient";

// Server component — cek session langsung lewat `auth()` supaya tombol
// Login/Register otomatis berganti jadi link ke Dashboard begitu user login,
// termasuk saat kembali ke Home (`/`) setelah login. Bagian interaktif
// (sticky on scroll, menu mobile — BAB 6.3.2) didelegasikan ke NavbarClient.
export async function Navbar() {
  const session = await auth();

  const authHref = session?.user
    ? session.user.role === "ADMIN"
      ? "/admin"
      : "/dashboard"
    : null;

  return <NavbarClient authHref={authHref} authLabel="Ke Dashboard" />;
}

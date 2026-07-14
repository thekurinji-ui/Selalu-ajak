import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Melindungi seluruh route /dashboard sesuai BAB 7 — Authentication.
// Tamu (belum login) diarahkan ke /login.
export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};

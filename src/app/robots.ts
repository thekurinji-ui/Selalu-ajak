import type { MetadataRoute } from "next";

// BAB 6.6 — SEO Strategy: Robots.txt. Next.js App Router otomatis
// menyajikan hasil fungsi ini di /robots.txt. Halaman dashboard, admin, dan
// API tidak perlu (dan tidak boleh) diindeks mesin pencari.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://selaluajak.kurinji.asia";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

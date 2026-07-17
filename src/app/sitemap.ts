import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// BAB 6.6 — SEO Strategy: Sitemap XML. Next.js App Router otomatis
// menyajikan hasil fungsi ini di /sitemap.xml. Menggabungkan halaman
// statis landing page dengan halaman undangan publik (/i/[slug]) yang
// berstatus PUBLISHED, supaya mesin pencari bisa mengindeks keduanya.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://selaluajak.kurinji.asia";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/register`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    take: 5000,
  });

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${siteUrl}/i/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...eventRoutes];
}

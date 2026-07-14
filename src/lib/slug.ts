import { prisma } from "@/lib/prisma";

// Menghasilkan slug undangan yang unik, mis. "puti-aldo" (BAB 9.6 & 10.11).
// URL akhirnya: selaluajak.kurinji.asia/i/{slug}
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function generateUniqueEventSlug(base: string) {
  const baseSlug = slugify(base) || "acara";
  let candidate = baseSlug;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

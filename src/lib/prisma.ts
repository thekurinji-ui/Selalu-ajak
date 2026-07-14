import { PrismaClient } from "@prisma/client";

// Pola standar Next.js agar tidak menghabiskan koneksi DB saat hot-reload
// membuat PrismaClient baru berkali-kali di development.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

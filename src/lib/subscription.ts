import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";

// BAB 18 — Subscription & Billing
// Setiap user seharusnya punya 1 Subscription (dibuat otomatis saat register,
// lihat src/app/api/register/route.ts). Fungsi ini jadi fallback untuk user
// lama yang dibuat sebelum fitur ini ada, supaya tidak error.
export async function getOrCreateSubscription(userId: string) {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.subscription.create({
    data: { userId, plan: "BASIC", status: "ACTIVE" },
  });
}

export async function getEventUsage(userId: string) {
  const subscription = await getOrCreateSubscription(userId);
  const usedEvents = await prisma.event.count({ where: { userId } });
  const config = PLANS[subscription.plan];

  return {
    subscription,
    plan: config,
    usedEvents,
    limitReached: usedEvents >= config.maxEvents,
  };
}

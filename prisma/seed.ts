import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed data minimal untuk development — satu akun demo + satu acara contoh.
async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@selaluajak.kurinji.asia" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@selaluajak.kurinji.asia",
      passwordHash,
    },
  });

  await prisma.event.upsert({
    where: { slug: "puti-aldo" },
    update: {},
    create: {
      userId: user.id,
      name: "Pernikahan Puti & Aldo",
      type: "PERNIKAHAN",
      slug: "puti-aldo",
      status: "PUBLISHED",
      date: new Date("2026-12-12T09:00:00+07:00"),
      location: "Gedung Serbaguna Kurinji",
      city: "Jakarta",
      description: "Dengan penuh syukur, kami mengundang Anda untuk hadir di hari bahagia kami.",
      invitationPage: { create: { sections: [] } },
    },
  });

  console.log("Seed selesai. Login demo: demo@selaluajak.kurinji.asia / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

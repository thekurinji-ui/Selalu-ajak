import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 16 — Digital Gift
async function saveDigitalGift(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  const message = formData.get("message") as string;
  const bankName = formData.get("bankName") as string;
  const bankNumber = formData.get("bankNumber") as string;
  const bankHolder = formData.get("bankHolder") as string;
  if (!eventId) return;

  const bankAccounts = bankName && bankNumber
    ? [{ bank: bankName, number: bankNumber, holder: bankHolder }]
    : [];

  await prisma.digitalGift.upsert({
    where: { eventId },
    create: { eventId, enabled: true, message, bankAccounts },
    update: { enabled: true, message, bankAccounts },
  });
}

export default async function GiftPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const gift = activeEventId
    ? await prisma.digitalGift.findUnique({ where: { eventId: activeEventId } })
    : null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Digital Gift</h1>

      <form
        action={saveDigitalGift}
        className="mt-6 grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft sm:grid-cols-2"
      >
        <input type="hidden" name="eventId" value={activeEventId ?? ""} />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Pesan Ucapan</label>
          <textarea
            name="message"
            rows={3}
            defaultValue={gift?.message ?? ""}
            className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            placeholder="Kehadiran dan doa restu Anda sudah menjadi hadiah yang sangat berarti bagi kami."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Bank</label>
          <Input name="bankName" placeholder="BCA" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nomor Rekening</label>
          <Input name="bankNumber" placeholder="1234567890" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Pemilik Rekening</label>
          <Input name="bankHolder" placeholder="Nama Pemilik" />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Simpan Pengaturan</Button>
        </div>
      </form>
    </div>
  );
}

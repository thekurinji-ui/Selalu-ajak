import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 13 — WhatsApp Blast
// Catatan: pengiriman aktual memerlukan WhatsApp Business API (lihat
// WHATSAPP_API_URL / WHATSAPP_API_TOKEN di .env). Di scaffold ini,
// kampanye disimpan dengan status MENUNGGU sebagai fondasi antrean.
async function createCampaign(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  const name = formData.get("name") as string;
  const templateText = formData.get("templateText") as string;
  if (!eventId || !name || !templateText) return;

  const recipientCount = await prisma.guest.count({ where: { eventId } });

  await prisma.whatsappCampaign.create({
    data: { eventId, name, templateText, recipientCount },
  });
}

export default async function WhatsappPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const campaigns = activeEventId
    ? await prisma.whatsappCampaign.findMany({
        where: { eventId: activeEventId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">WhatsApp Blast</h1>

      <form
        action={createCampaign}
        className="mt-6 grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft"
      >
        <input type="hidden" name="eventId" value={activeEventId ?? ""} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nama Kampanye</label>
          <Input name="name" required placeholder="Undangan Resmi" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Template Pesan</label>
          <textarea
            name="templateText"
            required
            rows={4}
            className="w-full rounded-md border border-champagne-200 px-3 py-2 text-sm focus:border-forest-500 focus:outline-none"
            placeholder="Halo {{nama_tamu}}, kami mengundang Anda untuk menghadiri {{nama_acara}}..."
          />
        </div>
        <div>
          <Button type="submit">Simpan Kampanye</Button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-champagne-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Kampanye</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Penerima</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-champagne-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.status}</td>
                <td className="px-4 py-3 text-slate-600">{c.recipientCount}</td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Belum ada kampanye WhatsApp Blast.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

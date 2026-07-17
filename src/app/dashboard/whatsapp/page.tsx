import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSubscription } from "@/lib/subscription";
import { PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendCampaignButton } from "@/components/dashboard/SendCampaignButton";
import { normalizeWhatsappNumber, renderWhatsappTemplate } from "@/lib/whatsapp";
import { formatDateID } from "@/lib/utils";

// BAB 13 — WhatsApp Blast, terhubung ke Fonnte (lihat src/lib/whatsapp.ts).
// Kampanye dibuat di sini berstatus MENUNGGU, lalu benar-benar dikirim lewat
// tombol "Kirim Sekarang" (SendCampaignButton) yang memanggil
// POST /api/whatsapp/campaigns/[id]/send.
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

const STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu Dikirim",
  DIPROSES: "Sedang Diproses",
  TERKIRIM: "Terkirim",
  GAGAL: "Gagal",
};

const STATUS_BADGE: Record<string, string> = {
  MENUNGGU: "bg-slate-100 text-slate-600",
  DIPROSES: "bg-champagne-100 text-champagne-700",
  TERKIRIM: "bg-forest-100 text-forest-700",
  GAGAL: "bg-red-100 text-red-600",
};

export default async function WhatsappPage({ searchParams }: { searchParams: { eventId?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [events, subscription] = await Promise.all([
    prisma.event.findMany({ where: { userId: session.user.id } }),
    getOrCreateSubscription(session.user.id),
  ]);
  const activeEventId = searchParams.eventId ?? events[0]?.id;
  const activeEvent = events.find((e) => e.id === activeEventId);
  const messageLimit = PLANS[subscription.plan].whatsappMessageLimit;

  const guests = activeEventId
    ? await prisma.guest.findMany({ where: { eventId: activeEventId }, orderBy: { name: "asc" } })
    : [];

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://selaluajak.kurinji.asia").replace(/\/$/, "");

  const campaigns = activeEventId
    ? await prisma.whatsappCampaign.findMany({
        where: { eventId: activeEventId },
        orderBy: { createdAt: "desc" },
        include: {
          recipients: {
            include: { guest: { select: { name: true, whatsapp: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">WhatsApp Blast</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ada 2 cara kirim: <span className="font-medium">Kirim Sekarang</span> (otomatis lewat Fonnte,
        pastikan device Fonnte Anda &ldquo;Connected&rdquo;) atau <span className="font-medium">Kirim
        Manual via WA Pribadi</span> (buka WhatsApp Anda sendiri per tamu, tanpa Fonnte).
      </p>

      <div className="mt-4 rounded-lg border border-champagne-200 bg-champagne-50 px-4 py-3 text-sm text-champagne-800">
        Kuota kirim paket <strong>{PLANS[subscription.plan].label}</strong> Anda: maks.{" "}
        <strong>{messageLimit.toLocaleString("id-ID")} penerima per kampanye</strong>. Kampanye dengan
        penerima lebih banyak dari itu perlu upgrade paket dulu untuk bisa dikirim.
      </div>

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
            placeholder="Halo {{nama_tamu}}, kami mengundang Anda untuk menghadiri {{nama_acara}} pada {{tanggal_acara}} di {{lokasi_acara}}. Info lengkap & RSVP: {{link_undangan}}"
          />
          <p className="mt-1 text-xs text-slate-400">
            Variabel tersedia: {"{{nama_tamu}}"}, {"{{nama_acara}}"}, {"{{tanggal_acara}}"},{" "}
            {"{{lokasi_acara}}"}, {"{{link_undangan}}"}.
          </p>
        </div>
        <div>
          <Button type="submit">Simpan Kampanye</Button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {campaigns.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-lg border border-champagne-100 bg-white shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">{c.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${STATUS_BADGE[c.status]}`}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  <span>{c.recipientCount} penerima</span>
                  {c.status !== "MENUNGGU" && (
                    <span>
                      &middot; {c.successCount} terkirim, {c.failedCount} gagal
                    </span>
                  )}
                </div>
              </div>
              {c.status === "MENUNGGU" &&
                (c.recipientCount <= messageLimit ? (
                  <SendCampaignButton campaignId={c.id} recipientCount={c.recipientCount} />
                ) : (
                  <span className="text-xs font-medium text-red-600">
                    Melebihi kuota paket (maks. {messageLimit.toLocaleString("id-ID")}) — upgrade untuk kirim
                  </span>
                ))}
            </div>

            {c.recipients.length > 0 && (
              <details className="border-t border-champagne-50">
                <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-500 hover:text-forest-600">
                  Lihat rincian pengiriman otomatis ({c.recipients.length})
                </summary>
                <table className="w-full text-left text-xs">
                  <thead className="bg-champagne-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Tamu</th>
                      <th className="px-4 py-2">Nomor</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.recipients.map((r) => (
                      <tr key={r.id} className="border-t border-champagne-50">
                        <td className="px-4 py-2">{r.guest.name}</td>
                        <td className="px-4 py-2 text-slate-500">{r.phone}</td>
                        <td className="px-4 py-2">{r.status}</td>
                        <td className="px-4 py-2 text-slate-500">{r.errorReason ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            )}

            {/* Kirim Manual via WA Pribadi — tiap tombol buka WhatsApp di HP
                pengguna sendiri dengan pesan sudah terisi otomatis, jadi yang
                terkirim itu WA pribadi client, bukan nomor Fonnte/TheKurinji.
                Tidak ada batas kuota di sini karena bukan blast otomatis —
                dikirim manual satu-satu oleh client. */}
            {activeEvent && (
              <details className="border-t border-champagne-50">
                <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-slate-500 hover:text-forest-600">
                  Kirim Manual via WA Pribadi ({guests.length} tamu)
                </summary>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-champagne-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-2">Tamu</th>
                        <th className="px-4 py-2">Nomor</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g) => {
                        const phone = normalizeWhatsappNumber(g.whatsapp);
                        const message = renderWhatsappTemplate(c.templateText, {
                          namaTamu: g.name,
                          namaAcara: activeEvent.name,
                          tanggalAcara: activeEvent.date ? formatDateID(activeEvent.date) : undefined,
                          lokasiAcara: activeEvent.location ?? undefined,
                          linkUndangan: `${appUrl}/i/${activeEvent.slug}?to=${encodeURIComponent(g.name)}`,
                        });
                        const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null;
                        return (
                          <tr key={g.id} className="border-t border-champagne-50">
                            <td className="px-4 py-2">{g.name}</td>
                            <td className="px-4 py-2 text-slate-500">{g.whatsapp}</td>
                            <td className="px-4 py-2 text-right">
                              {waLink ? (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block rounded-md bg-forest-600 px-3 py-1 font-medium text-white hover:bg-forest-700"
                                >
                                  Buka WA →
                                </a>
                              ) : (
                                <span className="text-red-500">Nomor tidak valid</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {guests.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                            Belum ada tamu di acara ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="px-4 py-2 text-xs text-slate-400">
                  Tiap tombol membuka WhatsApp Anda dengan pesan yang sudah terisi otomatis — tinggal tekan
                  kirim. Nomor pengirimnya nomor WhatsApp pribadi Anda sendiri, bukan Fonnte, jadi tidak
                  terpantau di rincian pengiriman otomatis di atas.
                </p>
              </details>
            )}
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="rounded-lg border border-champagne-100 bg-white px-4 py-8 text-center text-slate-400 shadow-soft">
            Belum ada kampanye WhatsApp Blast.
          </div>
        )}
      </div>
    </div>
  );
}

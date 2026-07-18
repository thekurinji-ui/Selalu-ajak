import { redirect } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guestSchema } from "@/lib/validation";
import { normalizeWhatsappNumber } from "@/lib/whatsapp";
import { parseGuestWorkbook } from "@/lib/guest-import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// BAB 11.4 — Menambahkan Tamu (Tambah Manual)
async function addGuest(formData: FormData) {
  "use server";

  const eventId = formData.get("eventId") as string;
  const parsed = guestSchema.safeParse({
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email") || "",
    category: formData.get("category") || undefined,
    companions: formData.get("companions") || 0,
  });

  if (!parsed.success || !eventId) return;

  await prisma.guest.create({
    data: {
      eventId,
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      email: parsed.data.email || null,
      category: parsed.data.category,
      companions: parsed.data.companions,
    },
  });
}

// BAB 11.5 — Import Tamu dari Excel. Client tinggal isi 1 file (xlsx/csv,
// header di baris pertama, nama kolom fleksibel — lihat parseGuestWorkbook)
// lalu upload di sini. Nomor duplikat (dibandingkan dengan tamu yang sudah
// ada di acara ini maupun sesama baris di file yang sama) otomatis dilewati
// supaya aman diulang-ulang kalau client kirim file yang sama dua kali.
async function importGuests(formData: FormData) {
  "use server";

  const eventId = formData.get("eventId") as string;
  const file = formData.get("file") as File | null;

  if (!eventId) redirect("/dashboard/guests");

  if (!file || file.size === 0) {
    redirect(
      `/dashboard/guests?eventId=${eventId}&importError=${encodeURIComponent("Pilih file Excel terlebih dahulu.")}`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: ReturnType<typeof parseGuestWorkbook>;
  try {
    parsed = parseGuestWorkbook(buffer);
  } catch {
    redirect(
      `/dashboard/guests?eventId=${eventId}&importError=${encodeURIComponent(
        "File tidak bisa dibaca. Pastikan formatnya .xlsx, .xls, atau .csv.",
      )}`,
    );
  }

  const { rows, errors } = parsed;

  if (rows.length === 0) {
    const message = errors[0]?.message ?? "Tidak ada data tamu yang bisa diimpor dari file ini.";
    redirect(`/dashboard/guests?eventId=${eventId}&importError=${encodeURIComponent(message)}`);
  }

  const existing = await prisma.guest.findMany({
    where: { eventId },
    select: { whatsapp: true },
  });
  const existingNumbers = new Set(
    existing.map((g) => normalizeWhatsappNumber(g.whatsapp)).filter((n): n is string => Boolean(n)),
  );

  const seenInFile = new Set<string>();
  const toInsert: {
    eventId: string;
    name: string;
    whatsapp: string;
    email: string | null;
    category: string | null;
    companions: number;
    note: string | null;
  }[] = [];
  let duplicateCount = 0;
  let invalidNumberCount = 0;

  for (const row of rows) {
    const normalized = normalizeWhatsappNumber(row.whatsapp);
    if (!normalized) {
      invalidNumberCount++;
      continue;
    }
    if (existingNumbers.has(normalized) || seenInFile.has(normalized)) {
      duplicateCount++;
      continue;
    }
    seenInFile.add(normalized);
    toInsert.push({
      eventId,
      name: row.name,
      whatsapp: normalized,
      email: row.email || null,
      category: row.category || null,
      companions: row.companions,
      note: row.note || null,
    });
  }

  if (toInsert.length > 0) {
    await prisma.guest.createMany({ data: toInsert });
  }

  const params = new URLSearchParams({ eventId, imported: String(toInsert.length) });
  const skipped = errors.length + invalidNumberCount;
  if (duplicateCount > 0) params.set("duplicates", String(duplicateCount));
  if (skipped > 0) params.set("skipped", String(skipped));

  redirect(`/dashboard/guests?${params.toString()}`);
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: {
    eventId?: string;
    imported?: string;
    duplicates?: string;
    skipped?: string;
    importError?: string;
  };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const events = await prisma.event.findMany({ where: { userId: session.user.id } });
  const activeEventId = searchParams.eventId ?? events[0]?.id;

  const guests = activeEventId
    ? await prisma.guest.findMany({
        where: { eventId: activeEventId },
        include: { rsvp: true, checkIn: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-forest-700">Guest Management</h1>

      {!activeEventId ? (
        <p className="mt-4 text-sm text-slate-500">
          Buat acara terlebih dahulu di halaman Events untuk mengelola tamu.
        </p>
      ) : (
        <>
          {/* BAB 11.13 — Dashboard Ringkas */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MiniStat label="Total Tamu" value={guests.length} />
            <MiniStat label="RSVP Hadir" value={guests.filter((g) => g.rsvp?.status === "AKAN_HADIR").length} />
            <MiniStat label="Sudah Check-in" value={guests.filter((g) => g.checkIn).length} />
          </div>

          {/* Feedback hasil import terakhir */}
          {searchParams.importError && (
            <div className="mt-6 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {searchParams.importError}
            </div>
          )}
          {searchParams.imported !== undefined && !searchParams.importError && (
            <div className="mt-6 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
              {Number(searchParams.imported)} tamu berhasil diimpor.
              {searchParams.duplicates ? ` ${searchParams.duplicates} nomor duplikat dilewati.` : ""}
              {searchParams.skipped ? ` ${searchParams.skipped} baris dilewati karena data tidak lengkap/tidak valid.` : ""}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* BAB 11.4 — Tambah Manual */}
            <form
              action={addGuest}
              className="grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft sm:grid-cols-2"
            >
              <input type="hidden" name="eventId" value={activeEventId} />
              <p className="sm:col-span-2 font-heading text-base font-semibold text-forest-700">Tambah Tamu Manual</p>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nama Tamu</label>
                <Input name="name" required placeholder="Bapak Andi" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                <Input name="whatsapp" required placeholder="0812xxxxxxxx" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
                <Input name="category" placeholder="Keluarga / Sahabat / VIP" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Jumlah Pendamping</label>
                <Input name="companions" type="number" min={0} defaultValue={0} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">+ Tambah Tamu</Button>
              </div>
            </form>

            {/* BAB 11.5 — Import dari Excel */}
            <form
              action={importGuests}
              encType="multipart/form-data"
              className="grid gap-4 rounded-lg border border-champagne-100 bg-white p-6 shadow-soft"
            >
              <input type="hidden" name="eventId" value={activeEventId} />
              <div className="flex items-center justify-between">
                <p className="font-heading text-base font-semibold text-forest-700">Import dari Excel</p>
                <a
                  href="/api/guests/template"
                  className="flex items-center gap-1 text-xs font-medium text-forest-600 hover:underline"
                >
                  <Download size={14} /> Unduh Template
                </a>
              </div>
              <p className="text-sm text-slate-500">
                Upload file <strong>.xlsx</strong> atau <strong>.csv</strong> berisi daftar nama & nomor WhatsApp
                tamu sekaligus. Kolom yang wajib: <strong>Nama</strong> dan <strong>WhatsApp</strong>. Nomor yang
                sudah pernah ditambahkan di acara ini otomatis dilewati.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Pilih File</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls,.csv"
                  required
                  className="block w-full rounded-md border border-champagne-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-forest-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-forest-700 hover:file:bg-forest-100"
                />
              </div>
              <div>
                <Button type="submit" className="flex items-center gap-1.5">
                  <Upload size={14} /> Import Sekarang
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-champagne-100 bg-white shadow-soft">
            <table className="w-full text-left text-sm">
              <thead className="bg-champagne-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">RSVP</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">QR</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => (
                  <tr key={guest.id} className="border-t border-champagne-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{guest.name}</td>
                    <td className="px-4 py-3 text-slate-600">{guest.whatsapp}</td>
                    <td className="px-4 py-3 text-slate-600">{guest.category ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge status={guest.rsvp?.status ?? "BELUM_MERESPONS"} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{guest.checkIn ? "Sudah Check-in" : "-"}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/guests/${guest.id}/qrcode`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-forest-600 hover:underline"
                      >
                        Lihat QR
                      </a>
                    </td>
                  </tr>
                ))}
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Belum ada tamu. Tambahkan tamu pertama Anda di atas, atau import dari Excel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-4 shadow-soft">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-forest-700">{value}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    BELUM_MERESPONS: "bg-slate-100 text-slate-600",
    AKAN_HADIR: "bg-success/10 text-success",
    TIDAK_HADIR: "bg-danger/10 text-danger",
  };
  const label: Record<string, string> = {
    BELUM_MERESPONS: "Belum Merespons",
    AKAN_HADIR: "Akan Hadir",
    TIDAK_HADIR: "Tidak Hadir",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
                    }

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface GuestRowData {
  id: string;
  name: string;
  whatsapp: string;
  category: string | null;
  companions: number;
  rsvpStatus: string;
  checkedIn: boolean;
}

interface GuestRowProps {
  guest: GuestRowData;
  updateGuest: (formData: FormData) => Promise<void>;
  deleteGuest: (formData: FormData) => Promise<void>;
}

// BAB 11.4 — Edit & Hapus Tamu. Komponen ini "use client" karena butuh state
// lokal untuk toggle mode edit per-baris; aksi simpan/hapusnya sendiri tetap
// Server Action (updateGuest/deleteGuest, didefinisikan di page.tsx) supaya
// query-nya jalan di server dan otomatis tervalidasi ulang kepemilikannya.
export function GuestRow({ guest, updateGuest, deleteGuest }: GuestRowProps) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <tr className="border-t border-champagne-50 bg-forest-50/40">
        <td colSpan={6} className="px-4 py-3">
          <form
            action={(formData) => {
              startTransition(async () => {
                await updateGuest(formData);
                setEditing(false);
              });
            }}
            className="grid gap-3 sm:grid-cols-5 sm:items-end"
          >
            <input type="hidden" name="guestId" value={guest.id} />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Nama</label>
              <Input name="name" defaultValue={guest.name} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">WhatsApp</label>
              <Input name="whatsapp" defaultValue={guest.whatsapp} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Kategori</label>
              <Input name="category" defaultValue={guest.category ?? ""} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Pendamping</label>
              <Input name="companions" type="number" min={0} defaultValue={guest.companions} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Menyimpan..." : "Simpan"}
              </Button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={pending}
                className="rounded-md border border-champagne-200 px-3 py-2 text-sm text-slate-600 hover:bg-champagne-50"
              >
                Batal
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-champagne-50">
      <td className="px-4 py-3 font-medium text-slate-800">{guest.name}</td>
      <td className="px-4 py-3 text-slate-600">{guest.whatsapp}</td>
      <td className="px-4 py-3 text-slate-600">{guest.category ?? "-"}</td>
      <td className="px-4 py-3">
        <Badge status={guest.rsvpStatus} />
      </td>
      <td className="px-4 py-3 text-slate-600">{guest.checkedIn ? "Sudah Check-in" : "-"}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <a
            href={`/api/guests/${guest.id}/qrcode`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-forest-600 hover:underline"
          >
            QR
          </a>
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={pending}
            className="text-sm font-medium text-forest-600 hover:underline"
          >
            Edit
          </button>
          <form
            action={(formData) => {
              const confirmed = window.confirm(
                `Hapus tamu "${guest.name}"? Data RSVP & check-in tamu ini juga akan ikut terhapus.`,
              );
              if (!confirmed) return;
              startTransition(() => deleteGuest(formData));
            }}
          >
            <input type="hidden" name="guestId" value={guest.id} />
            <button type="submit" disabled={pending} className="text-sm font-medium text-danger hover:underline">
              Hapus
            </button>
          </form>
        </div>
      </td>
    </tr>
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
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${map[status]}`}>{label[status]}</span>;
}

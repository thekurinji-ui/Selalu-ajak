import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// BAB 11.5 — Import Tamu dari Excel. Client cukup isi 1 file (xlsx atau csv)
// dengan header di baris pertama; nama kolom fleksibel (tidak harus persis
// sama dengan template) selama salah satu alias di HEADER_ALIASES cocok.
// ---------------------------------------------------------------------------

export interface ParsedGuestRow {
  name: string;
  whatsapp: string;
  email?: string;
  category?: string;
  companions: number;
  note?: string;
}

export interface GuestImportError {
  row: number; // nomor baris di file Excel (1-based, termasuk header)
  message: string;
}

export interface GuestImportResult {
  rows: ParsedGuestRow[];
  errors: GuestImportError[];
}

const HEADER_ALIASES = {
  name: ["nama", "nama tamu", "name", "nama lengkap"],
  whatsapp: [
    "whatsapp", "no whatsapp", "no. whatsapp", "nomor whatsapp",
    "no hp", "no. hp", "nomor hp", "phone", "telepon", "hp", "wa",
  ],
  email: ["email", "e-mail", "alamat email"],
  category: ["kategori", "category", "grup", "group"],
  companions: ["jumlah pendamping", "pendamping", "companions", "jumlah tamu tambahan"],
  note: ["catatan", "note", "keterangan"],
} as const;

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function findColumnIndex(headerRow: string[], aliases: readonly string[]): number {
  const normalized = headerRow.map(normalizeHeader);
  for (const alias of aliases) {
    const idx = normalized.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Baca buffer file .xlsx/.xls/.csv yang diunggah lewat form dashboard Guest
 * Management, lalu ubah jadi daftar baris tamu yang siap divalidasi & di-
 * simpan. Baris kosong dilewati diam-diam; baris yang punya sebagian data
 * tapi tidak lengkap (nama/whatsapp kosong) dicatat di `errors` supaya bisa
 * ditampilkan ke user, bukan langsung gagal seluruh file.
 */
export function parseGuestWorkbook(buffer: Buffer): GuestImportResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], errors: [{ row: 0, message: "File tidak memiliki sheet apa pun." }] };
  }
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false });

  if (raw.length === 0) {
    return { rows: [], errors: [{ row: 0, message: "File kosong." }] };
  }

  const headerRow = raw[0].map((c) => String(c ?? ""));
  const colName = findColumnIndex(headerRow, HEADER_ALIASES.name);
  const colWhatsapp = findColumnIndex(headerRow, HEADER_ALIASES.whatsapp);
  const colEmail = findColumnIndex(headerRow, HEADER_ALIASES.email);
  const colCategory = findColumnIndex(headerRow, HEADER_ALIASES.category);
  const colCompanions = findColumnIndex(headerRow, HEADER_ALIASES.companions);
  const colNote = findColumnIndex(headerRow, HEADER_ALIASES.note);

  if (colName === -1 || colWhatsapp === -1) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: 'Kolom "Nama" dan "WhatsApp" wajib ada di baris pertama (header). Unduh template kalau ragu.',
        },
      ],
    };
  }

  const rows: ParsedGuestRow[] = [];
  const errors: GuestImportError[] = [];

  for (let i = 1; i < raw.length; i++) {
    const line = raw[i];
    const rowNumber = i + 1;
    const name = String(line[colName] ?? "").trim();
    const whatsappRaw = String(line[colWhatsapp] ?? "").trim();

    if (!name && !whatsappRaw) continue; // baris benar-benar kosong

    if (!name) {
      errors.push({ row: rowNumber, message: `Baris ${rowNumber}: nama kosong.` });
      continue;
    }
    if (!whatsappRaw) {
      errors.push({ row: rowNumber, message: `Baris ${rowNumber}: nomor WhatsApp "${name}" kosong.` });
      continue;
    }

    const companionsRaw = colCompanions !== -1 ? line[colCompanions] : 0;
    const companionsParsed = Number.parseInt(String(companionsRaw ?? "0").trim() || "0", 10);

    rows.push({
      name,
      whatsapp: whatsappRaw,
      email: colEmail !== -1 ? String(line[colEmail] ?? "").trim() || undefined : undefined,
      category: colCategory !== -1 ? String(line[colCategory] ?? "").trim() || undefined : undefined,
      companions: Number.isFinite(companionsParsed) && companionsParsed > 0 ? companionsParsed : 0,
      note: colNote !== -1 ? String(line[colNote] ?? "").trim() || undefined : undefined,
    });
  }

  return { rows, errors };
}

/** Bikin file .xlsx template kosong (dengan 2 baris contoh) untuk diunduh dari Guest Management. */
export function buildGuestImportTemplate(): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Nama", "WhatsApp", "Kategori", "Jumlah Pendamping", "Email", "Catatan"],
    ["Bapak Andi Wijaya", "081234567890", "Keluarga", 1, "andi@email.com", ""],
    ["Ibu Siti Rahma", "6281298765432", "Sahabat", 0, "", "Alergi kacang"],
  ]);
  worksheet["!cols"] = [
    { wch: 24 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Tamu");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    }

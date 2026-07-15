import { z } from "zod";

// ---------------------------------------------------------------------------
// BAB 10.3 — Konsep Editor (Block-Based Builder)
// BAB 10.4 — Struktur Invitation (urutan default)
// BAB 10.5 — Komponen Section
//
// Kolom `InvitationPage.sections: Json` menyimpan array SectionInstance.
// File ini adalah satu-satunya sumber kebenaran untuk bentuk data tersebut,
// dipakai bersama oleh: API route (validasi simpan), Invitation Builder
// (editor drag-and-drop), dan halaman publik /i/[slug] (render).
// ---------------------------------------------------------------------------

export const SECTION_TYPES = [
  "cover",
  "opening_message",
  "couple",
  "event_info",
  "countdown",
  "story",
  "timeline",
  "gallery",
  "video",
  "maps",
  "rsvp",
  "digital_gift",
  "wishes",
  "footer",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export interface SectionInstance {
  id: string;
  type: SectionType;
  visible: boolean;
  data: Record<string, any>;
}

// Zod schema — dipakai API route untuk memvalidasi payload sebelum disimpan
// ke kolom Json, sehingga data yang masuk selalu berbentuk section yang sah.
export const sectionInstanceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(SECTION_TYPES),
  visible: z.boolean().default(true),
  data: z.record(z.any()).default({}),
});

export const sectionsSchema = z.array(sectionInstanceSchema).max(40);

// ---------------------------------------------------------------------------
// Section Library — metadata untuk panel "Tambah Section" pada editor.
// label & description mengikuti BAB 10.5. `defaultData` menjadi isi awal
// saat section baru ditambahkan pengguna.
// ---------------------------------------------------------------------------

export interface SectionLibraryEntry {
  type: SectionType;
  label: string;
  description: string;
  category: "Pembuka" | "Inti" | "Cerita" | "Media" | "Interaksi" | "Penutup";
  singleton?: boolean; // hanya boleh ada satu instance dalam undangan
  defaultData: Record<string, any>;
}

export const SECTION_LIBRARY: Record<SectionType, SectionLibraryEntry> = {
  cover: {
    type: "cover",
    label: "Opening Cover",
    description: "Foto utama, judul acara, nama penyelenggara, nama tamu, tombol buka undangan.",
    category: "Pembuka",
    singleton: true,
    defaultData: {
      photoUrl: "",
      eventTitle: "",
      hostName: "",
      openButtonLabel: "Buka Undangan",
    },
  },
  opening_message: {
    type: "opening_message",
    label: "Opening Message",
    description: "Sapaan pembuka dan kutipan singkat sebelum isi undangan.",
    category: "Pembuka",
    defaultData: {
      quote: "",
      message: "",
    },
  },
  couple: {
    type: "couple",
    label: "Couple / Host",
    description: "Informasi penyelenggara: nama, foto, orang tua, deskripsi singkat.",
    category: "Inti",
    singleton: true,
    defaultData: {
      members: [
        { name: "", photoUrl: "", parents: "", description: "" },
        { name: "", photoUrl: "", parents: "", description: "" },
      ],
    },
  },
  event_info: {
    type: "event_info",
    label: "Event Information",
    description: "Tanggal, jam, lokasi, alamat, dan dress code (opsional).",
    category: "Inti",
    singleton: true,
    defaultData: {
      dressCode: "",
      showTime: true,
    },
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    description: "Menghitung mundur waktu menuju acara secara otomatis.",
    category: "Inti",
    singleton: true,
    defaultData: {},
  },
  story: {
    type: "story",
    label: "Love Story / Story",
    description: "Menceritakan perjalanan pasangan atau latar belakang acara.",
    category: "Cerita",
    defaultData: {
      title: "Kisah Kami",
      body: "",
    },
  },
  timeline: {
    type: "timeline",
    label: "Timeline",
    description: "Urutan kegiatan acara, contoh: Akad, Resepsi, After Party.",
    category: "Cerita",
    defaultData: {
      items: [{ time: "", title: "", description: "" }],
    },
  },
  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "Galeri foto dengan tampilan Grid, Masonry, atau Carousel.",
    category: "Media",
    defaultData: {
      layout: "grid", // grid | masonry | carousel
      images: [] as string[],
    },
  },
  video: {
    type: "video",
    label: "Video",
    description: "Menyematkan video dari YouTube atau Vimeo.",
    category: "Media",
    defaultData: {
      provider: "youtube", // youtube | vimeo
      videoUrl: "",
    },
  },
  maps: {
    type: "maps",
    label: "Location & Maps",
    description: "Lokasi acara lengkap dengan tombol navigasi.",
    category: "Inti",
    defaultData: {
      mapsUrl: "",
      venueName: "",
    },
  },
  rsvp: {
    type: "rsvp",
    label: "RSVP",
    description: "Formulir konfirmasi kehadiran tamu.",
    category: "Interaksi",
    singleton: true,
    defaultData: {},
  },
  digital_gift: {
    type: "digital_gift",
    label: "Digital Gift",
    description: "Informasi hadiah digital: QRIS, transfer bank, dompet digital.",
    category: "Interaksi",
    singleton: true,
    defaultData: {},
  },
  wishes: {
    type: "wishes",
    label: "Wishes",
    description: "Buku tamu digital — tamu dapat mengirim doa dan ucapan.",
    category: "Interaksi",
    singleton: true,
    defaultData: {},
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "Ucapan penutup serta informasi tambahan.",
    category: "Penutup",
    singleton: true,
    defaultData: {
      closingMessage: "Terima kasih atas doa dan restu Anda.",
    },
  },
};

export function createSectionId() {
  return `sec_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createSectionInstance(type: SectionType): SectionInstance {
  return {
    id: createSectionId(),
    type,
    visible: true,
    data: structuredClone(SECTION_LIBRARY[type].defaultData),
  };
}

// BAB 10.4 — Urutan default undangan
const DEFAULT_ORDER: SectionType[] = [
  "cover",
  "opening_message",
  "couple",
  "event_info",
  "countdown",
  "story",
  "timeline",
  "gallery",
  "video",
  "maps",
  "rsvp",
  "digital_gift",
  "wishes",
  "footer",
];

export function getDefaultSections(): SectionInstance[] {
  return DEFAULT_ORDER.map((type) => createSectionInstance(type));
}

// Normalisasi nilai dari database: kalau kosong / bentuknya tidak sah,
// kembalikan struktur default agar editor & halaman publik tidak pernah
// menerima data yang rusak.
export function parseSections(raw: unknown): SectionInstance[] {
  const parsed = sectionsSchema.safeParse(raw);
  if (!parsed.success || parsed.data.length === 0) {
    return getDefaultSections();
  }
  return parsed.data as SectionInstance[];
      }

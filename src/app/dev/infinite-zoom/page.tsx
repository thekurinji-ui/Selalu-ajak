import { InfiniteZoomInvitation } from "@/components/invitation/InfiniteZoomInvitation";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";

// ---------------------------------------------------------------------------
// Halaman khusus buat nge-tes InfiniteZoomInvitation secara terisolasi.
// SENGAJA ditaruh di /dev/infinite-zoom — bukan /i/[slug] — supaya tidak
// nyentuh alur publik/template mana pun. Hapus folder `src/app/dev` ini
// kapan saja tanpa efek samping ke bagian lain aplikasi.
//
// Jalankan `npm run dev`, buka http://localhost:3000/dev/infinite-zoom
// ---------------------------------------------------------------------------

export default function InfiniteZoomDevPage() {
  return (
    <ThemeProvider theme={{ theme: "elegant" }}>
      <InfiniteZoomInvitation
        guestName="Salsabila Putri"
        eventName="Pernikahan Ayu & Bagas"
        scenes={[
          {
            id: "cover",
            imageUrl: "/FotoDemo/hero-photo.webp",
            eyebrow: "The Wedding of",
            title: "Ayu & Bagas",
            subtitle: "Sabtu, 12 Desember 2026",
          },
          {
            id: "bride",
            imageUrl: "/FotoDemo/foto-wanita.webp",
            eyebrow: "Mempelai Wanita",
            title: "Ayu Lestari",
            subtitle: "Putri pertama dari Bapak Sutrisno & Ibu Wulan",
          },
          {
            id: "groom",
            imageUrl: "/FotoDemo/foto-pria.webp",
            eyebrow: "Mempelai Pria",
            title: "Bagas Wicaksono",
            subtitle: "Putra kedua dari Bapak Hartono & Ibu Ratna",
          },
          {
            id: "moment-1",
            imageUrl: "/FotoDemo/gallery-01.webp",
            title: "Perjalanan kami dimulai dari sebuah kedai kopi kecil...",
          },
          {
            id: "moment-2",
            imageUrl: "/FotoDemo/gallery-03.webp",
            title: "...dan kini kami siap melangkah bersama, selamanya.",
          },
        ]}
        footer={{
          coupleNames: "Ayu & Bagas",
          dateLabel: "Sabtu, 12 Desember 2026 — Grand Ballroom, Jakarta",
          message:
            "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.",
        }}
      />
    </ThemeProvider>
  );
}

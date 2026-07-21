import { InfiniteZoomInvitation } from "@/components/invitation/InfiniteZoomInvitation";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";

// ---------------------------------------------------------------------------
// Halaman khusus buat nge-tes InfiniteZoomInvitation (revisi "mural rumah
// gadang") secara terisolasi. SENGAJA ditaruh di /dev/infinite-zoom — bukan
// /i/[slug] — supaya tidak nyentuh alur publik/template mana pun. Hapus
// folder `src/app/dev` ini kapan saja tanpa efek samping ke bagian lain
// aplikasi.
//
// Jalankan `npm run dev`, buka http://localhost:3000/dev/infinite-zoom
// ---------------------------------------------------------------------------

export default function InfiniteZoomDevPage() {
  return (
    <ThemeProvider theme={{ theme: "elegant" }}>
      <InfiniteZoomInvitation
        guestName="Salsabila Putri"
        coupleNames="Ayu & Bagas"
        coverEyebrow="The Wedding of"
        coverDateLabel="Sabtu, 12 Desember 2026"
        couplePhotoUrl="/FotoDemo/hero-photo.webp"
        openingMessage={{
          eyebrow: "Assalamu'alaikum Wr. Wb.",
          body: "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu di hari bahagia kami.",
        }}
        bride={{
          photoUrl: "/FotoDemo/foto-wanita.webp",
          name: "Ayu Lestari",
          parents: "Putri pertama dari Bapak Sutrisno & Ibu Wulan",
        }}
        groom={{
          photoUrl: "/FotoDemo/foto-pria.webp",
          name: "Bagas Wicaksono",
          parents: "Putra kedua dari Bapak Hartono & Ibu Ratna",
        }}
        events={[
          {
            id: "akad",
            label: "Akad Nikah",
            dateLabel: "Sabtu, 12 Desember 2026",
            timeLabel: "08.00 - 10.00 WIB",
            venueName: "Kediaman Mempelai Wanita",
            address: "Jl. Melati No. 12, Jakarta Selatan",
          },
          {
            id: "resepsi",
            label: "Resepsi",
            dateLabel: "Sabtu, 12 Desember 2026",
            timeLabel: "11.00 - 14.00 WIB",
            venueName: "Grand Ballroom",
            address: "Jl. Sudirman No. 45, Jakarta",
            mapsUrl: "https://maps.google.com",
          },
        ]}
        countdownTarget="2026-12-12T08:00:00+07:00"
        loveStory={[
          {
            year: "2019",
            title: "Awal Perjumpaan",
            body: "Perjalanan kami dimulai dari sebuah kedai kopi kecil di sudut kota.",
          },
          {
            year: "2022",
            title: "Melamar",
            body: "Bagas melamar Ayu di puncak Gunung Kerinci, disaksikan matahari terbit.",
          },
          {
            year: "2026",
            title: "Menikah",
            body: "Dan kini kami siap melangkah bersama, selamanya.",
          },
        ]}
        gallery={[
          "/FotoDemo/gallery-01.webp",
          "/FotoDemo/gallery-02.webp",
          "/FotoDemo/gallery-03.webp",
          "/FotoDemo/gallery-04.webp",
          "/FotoDemo/gallery-05.webp",
          "/FotoDemo/gallery-06.webp",
        ]}
        digitalGift={{
          message: "Kehadiran dan doa restu Anda sudah menjadi hadiah yang sangat berarti bagi kami.",
          accounts: [{ bank: "BCA", number: "1234567890", holder: "Ayu Lestari" }],
        }}
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

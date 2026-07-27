import { InfiniteZoomInvitation } from "@/components/invitation/InfiniteZoomInvitation";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";

// ---------------------------------------------------------------------------
// Halaman dev buat nge-tes InfiniteZoomInvitation v3 (mural depth-parallax)
// secara terisolasi. SENGAJA di /dev/infinite-zoom — bukan /i/[slug] — jadi
// tidak nyentuh alur publik/template mana pun. Diupdate mengikuti bentuk
// props v3 (coupleNames, couplePhotoUrl, bride/groom, events[], dst) yang
// beda total dari versi sebelumnya.
//
// Jalankan `npm run dev`, buka http://localhost:3000/dev/infinite-zoom
// ---------------------------------------------------------------------------

export default function InfiniteZoomDevPage() {
  return (
    <ThemeProvider theme={{ theme: "elegant" }}>
      <InfiniteZoomInvitation
        guestName="Salsabila Putri"
        coupleNames="Ayu & Bagas"
        coverDateLabel="Sabtu, 12 Desember 2026"
        couplePhotoUrl="/FotoDemo/hero-photo.webp"
        openingMessage={{
          eyebrow: "Assalamu'alaikum",
          body: "Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu.",
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
            address: "Jakarta Selatan",
          },
          {
            id: "resepsi",
            label: "Resepsi",
            dateLabel: "Sabtu, 12 Desember 2026",
            timeLabel: "11.00 - 14.00 WIB",
            venueName: "Grand Ballroom",
            address: "Jakarta",
          },
        ]}
        countdownTarget="2026-12-12T08:00:00"
        loveStory={[
          { year: "2019", title: "Pertama Bertemu", body: "Di sebuah kedai kopi kecil, tanpa sengaja." },
          { year: "2023", title: "Melamar", body: "Di pantai favorit kami, saat matahari terbenam." },
        ]}
        gallery={[
          "/FotoDemo/gallery-01.webp",
          "/FotoDemo/gallery-02.webp",
          "/FotoDemo/gallery-03.webp",
          "/FotoDemo/gallery-04.webp",
        ]}
        digitalGift={{
          message: "Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami.",
          accounts: [{ bank: "BCA", number: "1234567890", holder: "Ayu Lestari" }],
        }}
        footer={{
          coupleNames: "Ayu & Bagas",
          dateLabel: "Sabtu, 12 Desember 2026",
          message: "Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.",
        }}
        onSubmitRsvp={(formData) => {
          // eslint-disable-next-line no-console
          console.log("RSVP submitted:", Object.fromEntries(formData));
        }}
      />
    </ThemeProvider>
  );
}

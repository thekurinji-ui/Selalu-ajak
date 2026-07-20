import { ZoomCanvasInvitation } from "@/components/invitation/ZoomCanvas";
import { ThemeProvider } from "@/components/invitation/ThemeProvider";

// ---------------------------------------------------------------------------
// Halaman khusus buat nge-tes ZoomCanvasInvitation (prototipe kanvas 2D)
// secara terisolasi. SENGAJA ditaruh di /dev/zoom-canvas — bukan /i/[slug]
// — supaya tidak nyentuh alur publik/template mana pun. Hapus folder
// `src/app/dev` ini kapan saja tanpa efek samping ke bagian lain aplikasi.
//
// Jalankan `npm run dev`, buka http://localhost:3000/dev/zoom-canvas
// Scroll pelan-pelan buat rasain kameranya jalan ke tiap titik.
// ---------------------------------------------------------------------------

export default function ZoomCanvasDevPage() {
  return (
    <ThemeProvider theme={{ theme: "elegant" }}>
      <ZoomCanvasInvitation guestName="Salsabila Putri" eventName="Ayu & Bagas" />
    </ThemeProvider>
  );
}

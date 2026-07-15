import {
  HeritageOriginalTheme,
  sampleHeritageOriginalContent,
} from "@/components/invitation-themes/HeritageOriginalTheme";

// Halaman preview tema — belum terhubung ke data event asli.
// Nantinya, tinggal petakan InvitationPage.sections (BAB 10.3) atau data
// Event/Guest asli jadi objek HeritageOriginalContent lalu render di sini
// atau di /i/[slug] sebagai salah satu pilihan tema.
export default function HeritageOriginalPreviewPage() {
  return (
    <HeritageOriginalTheme
      content={{
        ...sampleHeritageOriginalContent,
        guestName: "Bapak/Ibu Tamu Undangan",
      }}
    />
  );
}

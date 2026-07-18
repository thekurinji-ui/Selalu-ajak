import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildGuestImportTemplate } from "@/lib/guest-import";

// BAB 11.5 — Import Tamu dari Excel: template kosong (header + 2 baris
// contoh) yang formatnya pasti dikenali oleh parseGuestWorkbook.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buffer = buildGuestImportTemplate();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-daftar-tamu-selalu-ajak.xlsx"',
    },
  });
}

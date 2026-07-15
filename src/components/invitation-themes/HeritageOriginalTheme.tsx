"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// "Heritage Original" — tema undangan orisinal buatan Selalu Ajak.
// Strukturnya mengikuti pola umum undangan pernikahan Indonesia (cover →
// sambutan tamu → mempelai → countdown → acara → galeri → love story →
// amplop digital → ucapan → penutup), tapi seluruh desain, motif, dan teks
// di file ini orisinal — bukan hasil menyalin template berbayar manapun.
// Dipakai lewat <HeritageOriginalTheme content={...} /> dengan data event
// asli (nanti bisa dipetakan dari InvitationPage.sections di BAB 10.3).
// ---------------------------------------------------------------------------

export type CoupleProfile = {
  nickname: string;
  fullName: string;
  parentsLine: string; // contoh: "Putri pertama dari Bapak ... & Ibu ..."
  photoUrl?: string;
  instagramUrl?: string;
};

export type EventSchedule = {
  label: string; // "Akad Nikah" | "Resepsi" | dst.
  day: string;
  date: string;
  time: string;
  venueName?: string;
  mapsUrl?: string;
};

export type LoveStoryMoment = {
  year: string;
  story: string;
};

export type GiftAccount = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type HeritageOriginalContent = {
  brideFirst: boolean; // urutan tampil: true = mempelai wanita duluan
  bride: CoupleProfile;
  groom: CoupleProfile;
  weddingDateISO: string; // dipakai untuk countdown, format ISO
  guestName?: string;
  coverImageUrl?: string;
  openingQuote?: string;
  schedules: EventSchedule[];
  galleryImages: string[];
  loveStory: LoveStoryMoment[];
  giftAccounts: GiftAccount[];
  giftAddress?: { recipient: string; address: string };
  closingMessage?: string;
};

export const sampleHeritageOriginalContent: HeritageOriginalContent = {
  brideFirst: true,
  bride: {
    nickname: "Aisyah",
    fullName: "Aisyah Putri Lestari",
    parentsLine: "Putri kedua dari Bapak Hendra Wijaya & Ibu Ratna Sari",
    instagramUrl: "https://instagram.com/",
  },
  groom: {
    nickname: "Bimo",
    fullName: "Bimo Aditya Nugraha",
    parentsLine: "Putra pertama dari Bapak Yusuf Nugraha & Ibu Siti Aminah",
    instagramUrl: "https://instagram.com/",
  },
  weddingDateISO: "2026-12-20T08:00:00+07:00",
  openingQuote:
    "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan untukmu agar kamu merasa tenteram kepadanya.",
  schedules: [
    { label: "Akad Nikah", day: "Minggu", date: "20 Desember 2026", time: "08.00 – 10.00 WIB", venueName: "Kediaman Mempelai Wanita" },
    { label: "Resepsi", day: "Minggu", date: "20 Desember 2026", time: "11.00 – 15.00 WIB", venueName: "Gedung Serbaguna Melati" },
  ],
  galleryImages: [],
  loveStory: [
    { year: "2019", story: "Dipertemukan lewat teman kuliah yang sama, obrolan singkat berlanjut jadi kebiasaan saling kabar tiap hari." },
    { year: "2022", story: "Melalui banyak cerita dan dukungan satu sama lain, kami memutuskan untuk melangkah lebih serius." },
    { year: "2026", story: "Dengan restu kedua keluarga, kami siap melanjutkan cerita ini ke jenjang pernikahan." },
  ],
  giftAccounts: [{ bankName: "Bank Contoh", accountNumber: "1234567890", accountName: "Aisyah Putri Lestari" }],
  giftAddress: { recipient: "Aisyah Putri Lestari", address: "Jl. Contoh Alamat No. 1, Jakarta" },
  closingMessage:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
};

function useCountdown(targetISO: string) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(targetISO).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  return remaining;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="mt-2 rounded-md border border-champagne-300 px-3 py-1.5 text-xs font-medium text-forest-700 transition hover:bg-champagne-50"
    >
      {copied ? "Tersalin!" : "Salin Nomor Rekening"}
    </button>
  );
}

// Ornamen pembatas orisinal — garis + belah ketupat kecil, bukan aset gambar.
function SectionDivider() {
  return (
    <div className="mx-auto my-8 flex w-32 items-center gap-3 text-champagne-400" aria-hidden>
      <span className="h-px flex-1 bg-champagne-300" />
      <span className="h-2 w-2 rotate-45 border border-champagne-400" />
      <span className="h-px flex-1 bg-champagne-300" />
    </div>
  );
}

function CoupleCard({ profile, align }: { profile: CoupleProfile; align: "left" | "right" }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-champagne-200 bg-champagne-50 shadow-medium">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoUrl} alt={profile.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-heading text-3xl text-champagne-400">
            {profile.nickname.charAt(0)}
          </div>
        )}
      </div>
      <h3 className="mt-5 font-heading text-2xl font-semibold text-forest-700">{profile.nickname}</h3>
      <p className="mt-1 text-sm text-slate-600">{profile.fullName}</p>
      <p className="mt-2 max-w-[220px] text-xs text-slate-500">{profile.parentsLine}</p>
      {profile.instagramUrl && (
        <a
          href={profile.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 rounded-full border border-forest-600 px-4 py-1.5 text-xs font-medium text-forest-700 transition hover:bg-forest-600 hover:text-white"
        >
          Instagram
        </a>
      )}
    </div>
  );
}

export function HeritageOriginalTheme({ content }: { content: HeritageOriginalContent }) {
  const [opened, setOpened] = useState(false);
  const countdown = useCountdown(content.weddingDateISO);
  const couples = content.brideFirst
    ? [content.bride, content.groom]
    : [content.groom, content.bride];

  return (
    <main className="relative min-h-screen overflow-hidden bg-ivory font-body">
      {/* Cover Gate — layar pembuka sebelum tamu klik "Buka Undangan" */}
      {!opened && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-700 px-6 text-center text-ivory"
          style={
            content.coverImageUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(27,48,34,0.75), rgba(27,48,34,0.85)), url(${content.coverImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <p className="font-heading text-xs uppercase tracking-[0.3em] text-champagne-200">
            The Wedding Of
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold md:text-6xl">
            {content.bride.nickname} &amp; {content.groom.nickname}
          </h1>
          {content.guestName && (
            <p className="mt-8 text-sm text-champagne-100">
              Kepada Yth. Bapak/Ibu/Saudara/i
              <br />
              <span className="font-heading text-lg text-white">{content.guestName}</span>
            </p>
          )}
          <button
            onClick={() => setOpened(true)}
            className="mt-10 rounded-full bg-champagne-500 px-8 py-3 text-sm font-semibold text-forest-800 shadow-floating transition hover:bg-champagne-400"
          >
            Buka Undangan
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="font-heading text-xs uppercase tracking-[0.3em] text-champagne-600">
          The Wedding Of
        </p>
        <h1 className="mt-4 font-heading text-5xl font-semibold text-forest-700 md:text-7xl">
          {content.bride.nickname}
          <span className="mx-3 text-champagne-500">&amp;</span>
          {content.groom.nickname}
        </h1>
        <p className="mt-6 text-sm text-slate-500">
          {new Date(content.weddingDateISO).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </section>

      {/* Opening Quote */}
      {content.openingQuote && (
        <section className="mx-auto max-w-xl px-6 pb-20 text-center">
          <SectionDivider />
          <p className="font-heading text-lg italic leading-relaxed text-forest-700">
            &ldquo;{content.openingQuote}&rdquo;
          </p>
        </section>
      )}

      {/* Mempelai */}
      <section className="bg-champagne-50/60 px-6 py-20">
        <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">
          Mempelai
        </h2>
        <div className="mx-auto mt-12 grid max-w-3xl gap-16 sm:grid-cols-2">
          <CoupleCard profile={couples[0]} align="left" />
          <CoupleCard profile={couples[1]} align="right" />
        </div>
      </section>

      {/* Countdown */}
      <section className="px-6 py-20 text-center">
        <h2 className="font-heading text-3xl font-semibold text-forest-700">Menuju Hari Bahagia</h2>
        <div className="mx-auto mt-8 flex max-w-md justify-center gap-4">
          {[
            { label: "Hari", value: countdown.d },
            { label: "Jam", value: countdown.h },
            { label: "Menit", value: countdown.m },
            { label: "Detik", value: countdown.s },
          ].map((u) => (
            <div key={u.label} className="flex-1 rounded-lg border border-champagne-200 bg-white py-4 shadow-soft">
              <p className="font-heading text-2xl font-semibold text-forest-700">
                {String(u.value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{u.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jadwal Acara */}
      <section className="bg-forest-700 px-6 py-20 text-center text-ivory">
        <h2 className="font-heading text-3xl font-semibold">Jadwal Acara</h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {content.schedules.map((s) => (
            <div key={s.label} className="rounded-lg border border-champagne-300/30 bg-forest-600/50 p-6">
              <h3 className="font-heading text-xl font-semibold text-champagne-200">{s.label}</h3>
              <p className="mt-3 text-sm">{s.day}, {s.date}</p>
              <p className="text-sm text-champagne-100">{s.time}</p>
              {s.venueName && <p className="mt-2 text-xs text-champagne-100/80">{s.venueName}</p>}
              {s.mapsUrl && (
                <a
                  href={s.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full border border-champagne-300 px-4 py-1.5 text-xs font-medium transition hover:bg-champagne-300 hover:text-forest-800"
                >
                  Google Maps
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Galeri */}
      {content.galleryImages.length > 0 && (
        <section className="px-6 py-20 text-center">
          <h2 className="font-heading text-3xl font-semibold text-forest-700">Galeri</h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {content.galleryImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Galeri ${i + 1}`} className="aspect-square w-full rounded-md object-cover" />
            ))}
          </div>
        </section>
      )}

      {/* Love Story */}
      {content.loveStory.length > 0 && (
        <section className="bg-champagne-50/60 px-6 py-20">
          <h2 className="text-center font-heading text-3xl font-semibold text-forest-700">Kisah Kami</h2>
          <div className="mx-auto mt-12 max-w-xl space-y-8 border-l-2 border-champagne-300 pl-6">
            {content.loveStory.map((m) => (
              <div key={m.year} className="relative">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-champagne-500" />
                <p className="font-heading text-lg font-semibold text-forest-700">{m.year}</p>
                <p className="mt-1 text-sm text-slate-600">{m.story}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amplop Digital */}
      {content.giftAccounts.length > 0 && (
        <section className="px-6 py-20 text-center">
          <h2 className="font-heading text-3xl font-semibold text-forest-700">Tanda Kasih</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
            Doa restu Bapak/Ibu/Saudara/i adalah karunia yang berarti bagi kami. Namun jika ingin
            memberi tanda kasih, kami sediakan di bawah ini.
          </p>
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-4">
            {content.giftAccounts.map((acc) => (
              <div key={acc.accountNumber} className="rounded-lg border border-champagne-200 bg-white p-5 shadow-soft">
                <p className="font-heading text-base font-semibold text-forest-700">{acc.bankName}</p>
                <p className="mt-1 text-sm text-slate-600">{acc.accountNumber}</p>
                <p className="text-xs text-slate-500">a.n. {acc.accountName}</p>
                <CopyButton value={acc.accountNumber} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ucapan / RSVP ditangani terpisah oleh halaman induk (BAB 12.4) */}

      {/* Penutup */}
      <section className="bg-forest-700 px-6 py-24 text-center text-ivory">
        <SectionDivider />
        {content.closingMessage && (
          <p className="mx-auto max-w-md text-sm leading-relaxed text-champagne-100">
            {content.closingMessage}
          </p>
        )}
        <h2 className="mt-8 font-heading text-2xl font-semibold">Kami Yang Berbahagia</h2>
        <p className="mt-2 font-heading text-3xl font-semibold text-champagne-200">
          {content.bride.nickname} &amp; {content.groom.nickname}
        </p>
      </section>

      <footer className="border-t border-champagne-100 bg-ivory py-8 text-center text-xs text-slate-400">
        Dipersembahkan melalui Selalu Ajak
      </footer>
    </main>
  );
      }

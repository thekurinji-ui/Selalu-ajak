"use client";

import { useEffect, useRef, useState } from "react";

type ScanResult = {
  status: "success" | "already" | "not_found" | "error";
  message: string;
};

// BAB 14.5 — Pemindaian kamera QR untuk Check-in.
// Menggunakan html5-qrcode (lazy-loaded di client) untuk membaca QR dari
// kamera perangkat, lalu mengirim kode ke /api/checkin/scan.
export function QrScanner() {
  const scannerElId = "qr-scanner-region";
  const scannerRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    return () => {
      // Pastikan kamera dimatikan saat komponen unmount.
      scannerRef.current?.stop?.().catch(() => {});
    };
  }, []);

  async function startScanning() {
    setLastResult(null);
    // Penting: tampilkan kontainer video DULU (sebelum kamera di-start), biar
    // ukurannya bukan 0x0 waktu html5-qrcode ngitung dimensi videonya. Kalau
    // kontainernya masih `hidden` (display:none) pas start() dipanggil,
    // kamera tetap nyala (izin browser sudah diberikan) tapi videonya nggak
    // pernah muncul di layar karena dirender ke elemen berukuran nol.
    setIsRunning(true);

    const { Html5Qrcode } = await import("html5-qrcode");

    const scanner = new Html5Qrcode(scannerElId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (cooldownRef.current) return;
          cooldownRef.current = true;
          await handleScanned(decodedText);
          setTimeout(() => {
            cooldownRef.current = false;
          }, 2000);
        },
        () => {
          // Diabaikan — dipanggil terus tiap frame yang gagal terbaca, bukan error fatal.
        },
      );
    } catch (err) {
      setIsRunning(false); // balikin kontainer ke hidden karena kamera gagal nyala
      setLastResult({
        status: "error",
        message: "Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.",
      });
    }
  }

  async function stopScanning() {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {
      // no-op
    }
    setIsRunning(false);
  }

  async function handleScanned(qrCode: string) {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      setLastResult({ status: data.status, message: data.message });
    } catch {
      setLastResult({ status: "error", message: "Gagal menghubungi server, coba lagi." });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="rounded-lg border border-champagne-100 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-forest-700">Scan QR Tamu</h2>
        {!isRunning ? (
          <button
            onClick={startScanning}
            className="inline-flex items-center justify-center rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-forest-700"
          >
            Mulai Kamera
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="inline-flex items-center justify-center rounded-md border border-champagne-200 bg-transparent px-4 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50"
          >
            Matikan Kamera
          </button>
        )}
      </div>

      <div
        id={scannerElId}
        className={`mt-4 mx-auto max-w-sm overflow-hidden rounded-lg ${isRunning ? "block" : "hidden"}`}
      />

      {!isRunning && (
        <p className="mt-4 text-sm text-slate-500">
          Klik &quot;Mulai Kamera&quot; lalu arahkan ke QR code pada undangan tamu.
        </p>
      )}

      {isProcessing && <p className="mt-3 text-sm text-slate-500">Memeriksa kode...</p>}

      {lastResult && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm font-medium ${
            lastResult.status === "success"
              ? "bg-success/10 text-success"
              : lastResult.status === "already"
                ? "bg-champagne-100 text-forest-800"
                : "bg-danger/10 text-danger"
          }`}
        >
          {lastResult.message}
        </div>
      )}
    </div>
  );
}

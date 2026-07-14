import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

// Cloudflare R2 — S3-compatible storage.
// Dipakai untuk menyimpan thumbnail & preview image template undangan
// (BAB baru: Template Management).

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Upload satu file gambar ke R2 dan kembalikan URL publiknya.
 * folder contoh: "templates/thumbnails" atau "templates/previews"
 */
export async function uploadImageToR2(
  file: File,
  folder: string,
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Tipe file tidak didukung: ${file.type}. Gunakan JPG, PNG, WEBP, atau GIF.`,
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file maksimal 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop() || "jpg";
  const key = `${folder}/${randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Hapus file dari R2 berdasarkan URL publiknya.
 * Dipakai saat admin hapus/ganti thumbnail template.
 */
export async function deleteImageFromR2(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith(R2_PUBLIC_URL)) return; // bukan file dari bucket kita, skip

  const key = publicUrl.replace(`${R2_PUBLIC_URL}/`, "");

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }),
  );
}

import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { serverEnv } from "@/lib/config/env.server";
import { uploadConstraints } from "@/lib/validations/upload";

type UploadInput = {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  folder: string;
};

export type UploadResult = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
};

function sanitizeFileName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return clean.length > 0 ? clean : "file";
}

function buildObjectKey(folder: string, fileName: string): string {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  const safeBase = sanitizeFileName(base);
  const safeExt = ext.toLowerCase();
  return `${folder}/${safeBase}-${randomUUID()}${safeExt}`;
}

function assertUploadConstraints(mimeType: string, size: number): void {
  if (!uploadConstraints.allowedMimeTypes.includes(mimeType as (typeof uploadConstraints.allowedMimeTypes)[number])) {
    throw new Error("Tipe file tidak didukung.");
  }

  if (size > uploadConstraints.maxBytes) {
    throw new Error("Ukuran file melebihi batas maksimum 5MB.");
  }
}

async function uploadToLocal(input: UploadInput): Promise<UploadResult> {
  const key = buildObjectKey(input.folder, input.fileName);
  const absolutePath = path.join(process.cwd(), "storage", "uploads", key);
  const publicPath = key.replace(/^uploads\//, "");

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, input.bytes);

  return {
    key,
    url: `/uploads/${publicPath}`,
    size: input.bytes.byteLength,
    mimeType: input.mimeType,
  };
}

async function uploadToS3(input: UploadInput): Promise<UploadResult> {
  if (!serverEnv.AWS_BUCKET || !serverEnv.AWS_DEFAULT_REGION) {
    throw new Error("Konfigurasi AWS belum lengkap.");
  }

  const key = buildObjectKey(input.folder, input.fileName);
  const client = new S3Client({
    region: serverEnv.AWS_DEFAULT_REGION,
    credentials: {
      accessKeyId: serverEnv.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: serverEnv.AWS_SECRET_ACCESS_KEY ?? "",
    },
    endpoint: serverEnv.AWS_ENDPOINT,
    forcePathStyle: serverEnv.AWS_USE_PATH_STYLE_ENDPOINT === "true",
  });

  await client.send(
    new PutObjectCommand({
      Bucket: serverEnv.AWS_BUCKET,
      Key: key,
      Body: input.bytes,
      ContentType: input.mimeType,
    }),
  );

  const url = serverEnv.AWS_URL
    ? `${serverEnv.AWS_URL.replace(/\/$/, "")}/${key}`
    : `https://${serverEnv.AWS_BUCKET}.s3.${serverEnv.AWS_DEFAULT_REGION}.amazonaws.com/${key}`;

  return {
    key,
    url,
    size: input.bytes.byteLength,
    mimeType: input.mimeType,
  };
}

export async function uploadFile(input: UploadInput): Promise<UploadResult> {
  assertUploadConstraints(input.mimeType, input.bytes.byteLength);

  if (serverEnv.FILESYSTEM_DISK === "s3") {
    return uploadToS3(input);
  }

  return uploadToLocal(input);
}

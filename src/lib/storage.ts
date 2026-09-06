import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// Object storage for every uploaded/generated file (creator photos,
// signed agreement PDFs, invoices, receipts, payout statements) — backed
// by Cloudflare R2 (S3-compatible). This used to write to the local
// filesystem, but that directory doesn't survive a Hostinger deploy
// (each deploy runs the app from a brand-new directory) — every file a
// user uploaded was silently lost on the next push. R2 fixes that.
//
// Access control is unchanged: this module has no opinion on who can
// read what — /api/images (public) and /api/files (session/token-gated)
// still mediate every read exactly as before, they just now fetch bytes
// from R2 instead of disk.
const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;

function getClient(): S3Client {
  if (!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !bucket) {
    throw new Error(
      "R2 storage is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.",
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

async function streamToBuffer(stream: NodeJS.ReadableStream | undefined): Promise<Buffer> {
  if (!stream) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function saveFile(
  buffer: Buffer,
  opts: { filename: string; extension?: string },
): Promise<string> {
  const client = getClient();
  const assetId = nanoid(24);
  const ext = opts.extension ?? "pdf";

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${assetId}.${ext}`,
      Body: buffer,
    }),
  );
  // Sidecar metadata object (mirrors the old local ".meta.json" file) so
  // downloads can suggest a friendly filename without re-deriving it.
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${assetId}.meta.json`,
      Body: JSON.stringify({ filename: opts.filename, extension: ext }),
      ContentType: "application/json",
    }),
  );
  return assetId;
}

export async function readAsset(
  assetId: string,
): Promise<{ buffer: Buffer; filename: string; extension: string } | null> {
  try {
    const client = getClient();
    const metaRes = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: `${assetId}.meta.json` }),
    );
    const metaRaw = (await streamToBuffer(metaRes.Body as NodeJS.ReadableStream)).toString("utf-8");
    const meta = JSON.parse(metaRaw) as { filename: string; extension: string };

    const fileRes = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: `${assetId}.${meta.extension}` }),
    );
    const buffer = await streamToBuffer(fileRes.Body as NodeJS.ReadableStream);
    return { buffer, filename: meta.filename, extension: meta.extension };
  } catch {
    return null;
  }
}

export function safeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-");
}

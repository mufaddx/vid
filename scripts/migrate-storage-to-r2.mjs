// One-off migration: uploads every file already sitting in the local
// ./storage directory (pre-R2 uploads — creator photos, generated
// agreement/invoice/receipt/payout PDFs) into R2, under the exact same
// asset ids, so every existing /api/images/<id> and /api/files/<id> URL
// already stored in the database keeps working unchanged once storage.ts
// reads from R2 instead of disk.
import { readdir, readFile } from "fs/promises";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

const accountId = process.env.R2_ACCOUNT_ID;
const bucket = process.env.R2_BUCKET;
if (!accountId || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !bucket) {
  console.error("Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET env vars.");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});

async function exists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  let files;
  try {
    files = await readdir(STORAGE_ROOT);
  } catch {
    console.log("No local ./storage directory — nothing to migrate.");
    return;
  }

  console.log(`Found ${files.length} local file(s) in ./storage.`);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of files) {
    const key = filename;
    const already = await exists(key);
    if (already) {
      skipped++;
      continue;
    }
    try {
      const buffer = await readFile(path.join(STORAGE_ROOT, filename));
      const contentType = filename.endsWith(".json")
        ? "application/json"
        : filename.endsWith(".pdf")
          ? "application/pdf"
          : filename.endsWith(".png")
            ? "image/png"
            : filename.endsWith(".webp")
              ? "image/webp"
              : "image/jpeg";
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
      uploaded++;
      if (uploaded % 25 === 0) console.log(`  ...${uploaded} uploaded so far`);
    } catch (e) {
      console.error(`  FAILED: ${filename}:`, e.message);
      failed++;
    }
  }

  console.log(`Done. uploaded=${uploaded} already-in-r2=${skipped} failed=${failed} total=${files.length}`);
  if (failed > 0) process.exitCode = 1;
}

main();

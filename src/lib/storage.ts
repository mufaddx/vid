import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

// Private local object storage for the prototype. In production this
// would be swapped for S3 / Supabase Storage with signed URLs (spec §22,
// §110) — access control is enforced by the /api/files route, never by
// exposing this directory directly.
const STORAGE_ROOT = path.join(process.cwd(), "storage");

export async function saveFile(
  buffer: Buffer,
  opts: { filename: string; extension?: string },
): Promise<string> {
  await mkdir(STORAGE_ROOT, { recursive: true });
  const assetId = nanoid(24);
  const ext = opts.extension ?? "pdf";
  await writeFile(path.join(STORAGE_ROOT, `${assetId}.${ext}`), buffer);
  // Sidecar metadata so downloads can suggest a friendly filename.
  await writeFile(
    path.join(STORAGE_ROOT, `${assetId}.meta.json`),
    JSON.stringify({ filename: opts.filename, extension: ext }),
  );
  return assetId;
}

export async function readAsset(
  assetId: string,
): Promise<{ buffer: Buffer; filename: string; extension: string } | null> {
  try {
    const metaRaw = await readFile(
      path.join(STORAGE_ROOT, `${assetId}.meta.json`),
      "utf-8",
    );
    const meta = JSON.parse(metaRaw) as { filename: string; extension: string };
    const buffer = await readFile(
      path.join(STORAGE_ROOT, `${assetId}.${meta.extension}`),
    );
    return { buffer, filename: meta.filename, extension: meta.extension };
  } catch {
    return null;
  }
}

export function safeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-");
}

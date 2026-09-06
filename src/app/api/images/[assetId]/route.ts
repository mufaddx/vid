import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Public, unauthenticated image serving — deliberately separate from
// /api/files (which is correctly session/token-gated for confidential
// PDFs). Creator photos need to load on the public site with no login,
// and since every asset is content-addressed by a random id, they're
// safe to cache forever.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  const asset = await readAsset(assetId);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = CONTENT_TYPES[asset.extension.toLowerCase()] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(asset.buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

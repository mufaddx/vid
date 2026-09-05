import { NextRequest, NextResponse } from "next/server";
import { readAsset } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Serves privately-stored generated PDFs (agreements, invoices, receipts,
// payout statements — spec §110/§144). Admins may fetch any asset with a
// valid session. Creators reach a completed agreement's PDF only via the
// secure, expiring signing token embedded in their email link — never by
// guessing the asset id.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const { assetId } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const session = await getSession();

  if (!session) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const agreement = await prisma.agreement.findFirst({
      where: {
        finalPdfAssetId: assetId,
        signingToken: token,
        status: "COMPLETED",
      },
    });
    if (!agreement || !agreement.signingTokenExpiresAt || agreement.signingTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: "Link expired or invalid" }, { status: 403 });
    }
  }

  const asset = await readAsset(assetId);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.buffer), {
    headers: {
      "Content-Type": asset.extension === "pdf" ? "application/pdf" : "application/octet-stream",
      "Content-Disposition": `inline; filename="${asset.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { renderAgreementPdf } from "@/lib/pdf/agreement-pdf";
import { renderCreatorManagementPdf } from "@/lib/pdf/creator-management-pdf";
import { renderBrandCollaborationPdf } from "@/lib/pdf/brand-collaboration-pdf";
import { parseDetails, resolveSocialHandles, type CreatorManagementDetails, type BrandCollaborationDetails } from "@/lib/agreement-details";
import { safeFilename } from "@/lib/storage";

// On-demand PDF for an agreement at any stage (draft, pending signature,
// or completed) — admin-only. Once an agreement is COMPLETED the locked
// final PDF is served from storage via /api/files instead; this route
// always renders the *current* content live, which is what an admin
// wants when previewing a draft before sending it (spec §70/§166).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { creator: { include: { socialAccounts: true } }, brand: true, signatures: true },
  });
  if (!agreement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });
  const details = parseDetails(agreement.details);

  let pdfBuffer: Buffer;
  if (details && agreement.type === "CREATOR_MANAGEMENT") {
    const cmDetails = details as CreatorManagementDetails;
    pdfBuffer = await renderCreatorManagementPdf({
      company,
      agreementNumber: agreement.agreementNumber,
      date: agreement.createdAt,
      creatorName: agreement.creator.name,
      creatorAddress: [agreement.creator.address, agreement.creator.city, agreement.creator.state, agreement.creator.country].filter(Boolean).join(", "),
      details: { ...cmDetails, socialHandles: resolveSocialHandles(cmDetails, agreement.creator.socialAccounts) },
      signatures: agreement.signatures
        .filter((s): s is typeof s & { signerType: "ADMIN" | "CREATOR" } => s.signerType !== "BRAND")
        .map((s) => ({ signerType: s.signerType, signerName: s.signerName, signedAt: s.signedAt, method: s.method, signatureAsset: s.signatureAsset })),
    });
  } else if (details && agreement.type === "BRAND_COLLABORATION") {
    pdfBuffer = await renderBrandCollaborationPdf({
      company,
      agreementNumber: agreement.agreementNumber,
      date: agreement.createdAt,
      brandName: agreement.brand?.name ?? "Brand",
      creatorName: agreement.creator.name,
      details: details as BrandCollaborationDetails,
      signatures: agreement.signatures.map((s) => ({ signerType: s.signerType, signerName: s.signerName, signedAt: s.signedAt })),
    });
  } else {
    pdfBuffer = await renderAgreementPdf({
      company,
      agreementNumber: agreement.agreementNumber,
      typeLabel: agreement.type.replaceAll("_", " ") + " Agreement",
      date: agreement.createdAt,
      creatorName: agreement.creator.name,
      brandName: agreement.brand?.name,
      content: agreement.content ?? "[]",
      signatures: agreement.signatures
        .filter((s): s is typeof s & { signerType: "ADMIN" | "CREATOR" } => s.signerType !== "BRAND")
        .map((s) => ({ signerType: s.signerType, signerName: s.signerName, signedAt: s.signedAt, method: s.method, signatureAsset: s.signatureAsset })),
    });
  }

  const filename = `${agreement.agreementNumber}-${safeFilename(agreement.creator.name)}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

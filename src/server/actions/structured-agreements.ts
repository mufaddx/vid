"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { nextDocumentNumber } from "@/lib/numbering";
import { sendEmail } from "@/lib/email/send";
import { agreementReadyEmail, agreementCompletedEmail } from "@/lib/email/templates";
import { formatDate } from "@/lib/format";
import { saveFile, safeFilename } from "@/lib/storage";
import { renderCreatorManagementPdf } from "@/lib/pdf/creator-management-pdf";
import { renderBrandCollaborationPdf } from "@/lib/pdf/brand-collaboration-pdf";
import {
  type CreatorManagementDetails,
  type BrandCollaborationDetails,
} from "@/lib/agreement-details";

export type ActionResult = { ok: true; agreementId: string } | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Creator Management Agreement
// ---------------------------------------------------------------------------

const creatorManagementSchema = z.object({
  creatorId: z.string().min(1),
  commissionPercentage: z.coerce.number().min(0).max(100),
  details: z.custom<CreatorManagementDetails>(),
});

export async function createCreatorManagementAgreementAction(input: {
  creatorId: string;
  commissionPercentage: number;
  details: CreatorManagementDetails;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authorized." };

  const parsed = creatorManagementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const { creatorId, commissionPercentage, details } = parsed.data;

  const [creator, company] = await Promise.all([
    prisma.creator.findUnique({ where: { id: creatorId } }),
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
  ]);
  if (!creator) return { ok: false, error: "Creator not found." };

  const agreementNumber = await nextDocumentNumber(company.agreementPrefix);

  const agreement = await prisma.agreement.create({
    data: {
      agreementNumber,
      type: "CREATOR_MANAGEMENT",
      creatorId,
      status: "DRAFT",
      content: null,
      details: details as object,
      startDate: new Date(details.agreementDate),
      // No endDate: a Creator Management Agreement is open-ended once
      // signed, terminated only via a separate Cancellation Agreement.
      commissionPercentage,
      createdById: session.id,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Creator Management Agreement ${agreementNumber} created`,
    entityType: "Agreement",
    entityId: agreement.id,
    creatorId,
  });

  return { ok: true, agreementId: agreement.id };
}

export async function updateCreatorManagementDetailsAction(
  agreementId: string,
  input: { commissionPercentage: number; details: CreatorManagementDetails },
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authorized." };

  const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });
  if (!agreement) return { ok: false, error: "Agreement not found." };
  if (agreement.status !== "DRAFT") return { ok: false, error: "Only draft agreements can be edited." };

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      details: input.details as object,
      commissionPercentage: input.commissionPercentage,
      startDate: new Date(input.details.agreementDate),
      version: { increment: 1 },
    },
  });

  await logActivity({ actorId: session.id, action: "Agreement details updated", entityType: "Agreement", entityId: agreementId });
  revalidatePath(`/admin/agreements/${agreementId}`);
  return { ok: true, agreementId };
}

// ---------------------------------------------------------------------------
// Brand Collaboration Agreement
// ---------------------------------------------------------------------------

const brandCollaborationSchema = z.object({
  creatorId: z.string().min(1),
  brandId: z.string().min(1),
  campaignId: z.string().optional(),
  details: z.custom<BrandCollaborationDetails>(),
});

export async function createBrandCollaborationAgreementAction(input: {
  creatorId: string;
  brandId: string;
  campaignId?: string;
  details: BrandCollaborationDetails;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authorized." };

  const parsed = brandCollaborationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };
  const { creatorId, brandId, campaignId, details } = parsed.data;

  const [creator, brand, company] = await Promise.all([
    prisma.creator.findUnique({ where: { id: creatorId } }),
    prisma.brand.findUnique({ where: { id: brandId } }),
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
  ]);
  if (!creator) return { ok: false, error: "Creator not found." };
  if (!brand) return { ok: false, error: "Brand not found." };

  const agreementNumber = await nextDocumentNumber(company.agreementPrefix);

  const agreement = await prisma.agreement.create({
    data: {
      agreementNumber,
      type: "BRAND_COLLABORATION",
      creatorId,
      brandId,
      campaignId: campaignId || undefined,
      status: "DRAFT",
      content: null,
      details: details as object,
      startDate: new Date(details.campaignStartDate),
      endDate: new Date(details.campaignEndDate),
      commissionPercentage: creator.commissionPercentage,
      createdById: session.id,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Brand Collaboration Agreement ${agreementNumber} created`,
    entityType: "Agreement",
    entityId: agreement.id,
    creatorId,
  });

  return { ok: true, agreementId: agreement.id };
}

export async function updateBrandCollaborationDetailsAction(
  agreementId: string,
  details: BrandCollaborationDetails,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not authorized." };

  const agreement = await prisma.agreement.findUnique({ where: { id: agreementId } });
  if (!agreement) return { ok: false, error: "Agreement not found." };
  if (agreement.status !== "DRAFT") return { ok: false, error: "Only draft agreements can be edited." };

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      details: details as object,
      startDate: new Date(details.campaignStartDate),
      endDate: new Date(details.campaignEndDate),
      version: { increment: 1 },
    },
  });

  await logActivity({ actorId: session.id, action: "Agreement details updated", entityType: "Agreement", entityId: agreementId });
  revalidatePath(`/admin/agreements/${agreementId}`);
  return { ok: true, agreementId };
}

// ---------------------------------------------------------------------------
// Shared: render + lock the structured PDF once every required signer has
// signed. Creator Management needs ADMIN + CREATOR; Brand Collaboration
// needs BRAND + ADMIN + CREATOR (spec §10).
// ---------------------------------------------------------------------------

export async function tryCompleteStructuredAgreement(agreementId: string): Promise<void> {
  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreementId },
    include: { creator: true, brand: true, signatures: true },
  });
  if (agreement.status === "COMPLETED" || !agreement.details) return;

  const signerTypes = new Set(agreement.signatures.map((s) => s.signerType));
  const required: ("ADMIN" | "CREATOR" | "BRAND")[] =
    agreement.type === "BRAND_COLLABORATION" ? ["ADMIN", "CREATOR", "BRAND"] : ["ADMIN", "CREATOR"];
  if (!required.every((r) => signerTypes.has(r))) return;

  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });
  const details = agreement.details as unknown as CreatorManagementDetails | BrandCollaborationDetails;

  let pdfBuffer: Buffer;
  if (agreement.type === "CREATOR_MANAGEMENT") {
    pdfBuffer = await renderCreatorManagementPdf({
      company,
      agreementNumber: agreement.agreementNumber,
      date: agreement.createdAt,
      creatorName: agreement.creator.name,
      creatorAddress: [agreement.creator.address, agreement.creator.city, agreement.creator.country].filter(Boolean).join(", "),
      details: details as CreatorManagementDetails,
      signatures: agreement.signatures.map((s) => ({ signerType: s.signerType as "ADMIN" | "CREATOR", signerName: s.signerName, signedAt: s.signedAt })),
    });
  } else {
    pdfBuffer = await renderBrandCollaborationPdf({
      company,
      agreementNumber: agreement.agreementNumber,
      date: agreement.createdAt,
      brandName: agreement.brand?.name ?? "Brand",
      creatorName: agreement.creator.name,
      details: details as BrandCollaborationDetails,
      signatures: agreement.signatures.map((s) => ({ signerType: s.signerType as "ADMIN" | "CREATOR" | "BRAND", signerName: s.signerName, signedAt: s.signedAt })),
    });
  }

  const assetId = await saveFile(pdfBuffer, {
    filename: `${agreement.agreementNumber}-${safeFilename(agreement.creator.name)}.pdf`,
  });

  const downloadExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      finalPdfAssetId: assetId,
      signingTokenExpiresAt: agreement.signingToken ? downloadExpiry : undefined,
      brandSigningTokenExpiresAt: agreement.brandSigningToken ? downloadExpiry : undefined,
    },
  });

  await prisma.document.create({
    data: {
      creatorId: agreement.creatorId,
      agreementId: agreement.id,
      category: "AGREEMENT",
      title: `${agreement.agreementNumber} — Signed Agreement`,
      assetId,
    },
  });

  await prisma.agreementAuditLog.create({ data: { agreementId, event: "Completed", actor: "system" } });
  await logActivity({ action: `Agreement ${agreement.agreementNumber} completed`, entityType: "Agreement", entityId: agreementId, creatorId: agreement.creatorId });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (agreement.creator.email && agreement.signingToken) {
    await sendEmail({
      to: agreement.creator.email,
      subject: `Agreement ${agreement.agreementNumber} completed`,
      html: agreementCompletedEmail({
        creatorName: agreement.creator.name,
        agreementNumber: agreement.agreementNumber,
        downloadUrl: `${siteUrl}/api/files/${assetId}?token=${agreement.signingToken}`,
      }),
      template: "agreement_completed",
    });
  }
  if (agreement.brand?.email && agreement.brandSigningToken) {
    await sendEmail({
      to: agreement.brand.email,
      subject: `Agreement ${agreement.agreementNumber} completed`,
      html: agreementCompletedEmail({
        creatorName: agreement.brand.name,
        agreementNumber: agreement.agreementNumber,
        downloadUrl: `${siteUrl}/api/files/${assetId}?token=${agreement.brandSigningToken}`,
      }),
      template: "agreement_completed",
    });
  }
}

// ---------------------------------------------------------------------------
// Sending for signature — generalized to also issue a brand link when the
// agreement type requires one.
// ---------------------------------------------------------------------------

export async function sendStructuredAgreementForSignatureAction(agreementId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreementId },
    include: { creator: true, brand: true, signatures: true },
  });

  if (!agreement.signatures.some((s) => s.signerType === "ADMIN")) {
    throw new Error("VIDLIX must sign the agreement before sending it.");
  }
  if (!agreement.creator.email) {
    throw new Error("Creator has no email on file.");
  }
  if (agreement.type === "BRAND_COLLABORATION" && !agreement.brand?.email) {
    throw new Error("Brand has no contact email on file.");
  }

  const signingTokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const creatorToken = randomBytes(24).toString("hex");
  const brandToken = agreement.type === "BRAND_COLLABORATION" ? randomBytes(24).toString("hex") : undefined;

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      status: "PENDING_SIGNATURE",
      signingToken: creatorToken,
      signingTokenExpiresAt,
      brandSigningToken: brandToken,
      brandSigningTokenExpiresAt: brandToken ? signingTokenExpiresAt : undefined,
      sentAt: new Date(),
    },
  });

  await prisma.agreementAuditLog.create({ data: { agreementId, event: "Sent for signature", actor: session.email } });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendEmail({
    to: agreement.creator.email,
    subject: `VIDLIX Agreement ${agreement.agreementNumber} — Review & Sign`,
    html: agreementReadyEmail({
      creatorName: agreement.creator.name,
      agreementNumber: agreement.agreementNumber,
      validityText: `Valid through ${formatDate(signingTokenExpiresAt)}`,
      signingUrl: `${siteUrl}/agreement/sign/${creatorToken}`,
    }),
    template: "agreement_ready",
  });

  if (brandToken && agreement.brand?.email) {
    await sendEmail({
      to: agreement.brand.email,
      subject: `VIDLIX Agreement ${agreement.agreementNumber} — Review & Sign`,
      html: agreementReadyEmail({
        creatorName: agreement.brand.contactPerson ?? agreement.brand.name,
        agreementNumber: agreement.agreementNumber,
        validityText: `Valid through ${formatDate(signingTokenExpiresAt)}`,
        signingUrl: `${siteUrl}/agreement/sign/${brandToken}`,
      }),
      template: "agreement_ready",
    });
  }

  await logActivity({
    actorId: session.id,
    action: `Agreement ${agreement.agreementNumber} sent for signature`,
    entityType: "Agreement",
    entityId: agreementId,
    creatorId: agreement.creatorId,
  });

  revalidatePath(`/admin/agreements/${agreementId}`);
}

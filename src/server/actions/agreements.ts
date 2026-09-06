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
import { renderTemplate, buildAgreementVariables } from "@/lib/variables";
import { parseSections, stringifySections } from "@/lib/agreement-content";
import { formatDate } from "@/lib/format";
import { saveFile, safeFilename } from "@/lib/storage";
import { renderAgreementPdf } from "@/lib/pdf/agreement-pdf";
import { requirePermission } from "@/lib/permissions";

const createSchema = z.object({
  templateId: z.string().min(1),
  creatorId: z.string().min(1),
  brandId: z.string().optional(),
  campaignId: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  commissionPercentage: z.coerce.number().min(0).max(100),
});

export async function createAgreementAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  await requirePermission(session, "agreements");

  const raw = Object.fromEntries(formData.entries());
  const data = createSchema.parse(raw);

  const [template, creator, company, brand, campaign] = await Promise.all([
    prisma.agreementTemplate.findUniqueOrThrow({ where: { id: data.templateId } }),
    prisma.creator.findUniqueOrThrow({ where: { id: data.creatorId } }),
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
    data.brandId ? prisma.brand.findUnique({ where: { id: data.brandId } }) : null,
    data.campaignId ? prisma.campaign.findUnique({ where: { id: data.campaignId } }) : null,
  ]);

  const agreementNumber = await nextDocumentNumber(company.agreementPrefix);

  const variables = buildAgreementVariables({
    creator,
    brand,
    campaign,
    agreement: {
      agreementNumber,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      commissionPercentage: data.commissionPercentage,
      createdAt: new Date(),
    },
    company,
  });

  const sections = parseSections(template.content).map((s) => ({
    ...s,
    body: renderTemplate(s.body, variables),
  }));

  const agreement = await prisma.agreement.create({
    data: {
      agreementNumber,
      type: template.type,
      creatorId: data.creatorId,
      brandId: data.brandId || undefined,
      campaignId: data.campaignId || undefined,
      templateId: data.templateId,
      status: "DRAFT",
      content: stringifySections(sections),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      commissionPercentage: data.commissionPercentage,
      createdById: session.id,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Agreement ${agreementNumber} created`,
    entityType: "Agreement",
    entityId: agreement.id,
    creatorId: data.creatorId,
  });

  redirect(`/admin/agreements/${agreement.id}`);
}

export async function updateAgreementContentAction(id: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  await requirePermission(session, "agreements");

  const sectionsJson = String(formData.get("sections") || "[]");
  await prisma.agreement.update({
    where: { id },
    data: { content: sectionsJson, version: { increment: 1 } },
  });

  await logActivity({
    actorId: session.id,
    action: "Agreement content edited",
    entityType: "Agreement",
    entityId: id,
  });

  revalidatePath(`/admin/agreements/${id}`);
}

export async function adminSignAgreementAction(id: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const method = String(formData.get("method") || "type");
  const signatureAsset = String(formData.get("signatureAsset") || "");
  const signerName = String(formData.get("signerName") || session.name);

  await prisma.signature.create({
    data: {
      agreementId: id,
      signerType: "ADMIN",
      signerName,
      signerEmail: session.email,
      method,
      signatureAsset,
      otpVerified: true,
    },
  });

  await prisma.agreementAuditLog.create({
    data: { agreementId: id, event: "Admin Signed", actor: session.email },
  });

  await logActivity({
    actorId: session.id,
    action: "Agreement signed by admin",
    entityType: "Agreement",
    entityId: id,
  });

  revalidatePath(`/admin/agreements/${id}`);
}

export async function sendForSignatureAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id },
    include: { creator: true, signatures: true },
  });

  if (!agreement.signatures.some((s) => s.signerType === "ADMIN")) {
    throw new Error("VIDLIX must sign the agreement before sending it to the creator.");
  }
  if (!agreement.creator.email) {
    throw new Error("Creator has no email on file.");
  }

  const signingToken = randomBytes(24).toString("hex");
  const signingTokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await prisma.agreement.update({
    where: { id },
    data: { status: "PENDING_SIGNATURE", signingToken, signingTokenExpiresAt, sentAt: new Date() },
  });

  await prisma.agreementAuditLog.create({
    data: { agreementId: id, event: "Sent for signature", actor: session.email },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  await sendEmail({
    to: agreement.creator.email,
    subject: `VIDLIX Agreement ${agreement.agreementNumber} — Review & Sign`,
    html: agreementReadyEmail({
      creatorName: agreement.creator.name,
      agreementNumber: agreement.agreementNumber,
      validityText: `Valid through ${formatDate(signingTokenExpiresAt)}`,
      signingUrl: `${siteUrl}/agreement/sign/${signingToken}`,
    }),
    template: "agreement_ready",
  });

  await logActivity({
    actorId: session.id,
    action: `Agreement ${agreement.agreementNumber} sent for signature`,
    entityType: "Agreement",
    entityId: id,
    creatorId: agreement.creatorId,
  });

  revalidatePath(`/admin/agreements/${id}`);
}

/** Renders + stores the final locked PDF once every required signature is present. */
export async function tryCompleteAgreement(agreementId: string): Promise<void> {
  const agreement = await prisma.agreement.findUniqueOrThrow({
    where: { id: agreementId },
    include: { creator: true, brand: true, signatures: true },
  });

  // Structured agreements (Creator Management / Brand Collaboration) are
  // completed via tryCompleteStructuredAgreement instead — this legacy
  // path only ever applies to free-text `content` agreements.
  if (agreement.details) return;

  const hasAdmin = agreement.signatures.some((s) => s.signerType === "ADMIN");
  const hasCreator = agreement.signatures.some((s) => s.signerType === "CREATOR");
  if (!hasAdmin || !hasCreator || agreement.status === "COMPLETED") return;

  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });

  const pdfBuffer = await renderAgreementPdf({
    company,
    agreementNumber: agreement.agreementNumber,
    typeLabel: agreement.type.replaceAll("_", " ") + " Agreement",
    date: agreement.createdAt,
    creatorName: agreement.creator.name,
    brandName: agreement.brand?.name,
    content: agreement.content ?? "[]",
    signatures: agreement.signatures
      .filter((s): s is typeof s & { signerType: "ADMIN" | "CREATOR" } => s.signerType !== "BRAND")
      .map((s) => ({
        signerType: s.signerType,
        signerName: s.signerName,
        signedAt: s.signedAt,
        method: s.method,
        signatureAsset: s.signatureAsset,
      })),
  });

  const assetId = await saveFile(pdfBuffer, {
    filename: `${agreement.agreementNumber}-${safeFilename(agreement.creator.name)}.pdf`,
  });

  // Extend the signing token window so the creator can keep using the same
  // link to download the completed PDF (spec §69/§70).
  const downloadExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      finalPdfAssetId: assetId,
      signingTokenExpiresAt: downloadExpiry,
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

  await prisma.agreementAuditLog.create({
    data: { agreementId, event: "Completed", actor: "system" },
  });

  await logActivity({
    action: `Agreement ${agreement.agreementNumber} completed`,
    entityType: "Agreement",
    entityId: agreementId,
    creatorId: agreement.creatorId,
  });

  if (agreement.creator.email && agreement.signingToken) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
}

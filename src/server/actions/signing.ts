"use server";

import { prisma } from "@/lib/prisma";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { tryCompleteAgreement } from "@/server/actions/agreements";
import { tryCompleteStructuredAgreement } from "@/server/actions/structured-agreements";

const agreementWithParties = {
  creator: true,
  brand: true,
  signatures: true,
} as const;

type SignerRole = "CREATOR" | "BRAND";

/**
 * Creator Management agreements only ever have a creator signing token.
 * Brand Collaboration agreements hand out a second, independent token to
 * the brand contact (spec §10: Brand + VIDLIX + Creator) — so a token can
 * resolve to either party depending on which field it matches.
 */
async function resolveSigner(token: string) {
  const [byCreator, byBrand] = await Promise.all([
    prisma.agreement.findUnique({ where: { signingToken: token }, include: agreementWithParties }),
    prisma.agreement.findUnique({ where: { brandSigningToken: token }, include: agreementWithParties }),
  ]);

  if (byCreator) return { agreement: byCreator, role: "CREATOR" as SignerRole, email: byCreator.creator.email };
  if (byBrand) return { agreement: byBrand, role: "BRAND" as SignerRole, email: byBrand.brand?.email ?? null };
  return null;
}

export async function recordAgreementViewedAction(token: string): Promise<void> {
  const resolved = await resolveSigner(token);
  if (!resolved) return;
  const { agreement, role, email } = resolved;
  if (!agreement.viewedAt) {
    await prisma.agreement.update({ where: { id: agreement.id }, data: { viewedAt: new Date() } });
  }
  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: `Viewed by ${role.toLowerCase()}`, actor: email ?? role },
  });
}

export type OtpRequestState = { ok: boolean; error?: string; maskedEmail?: string };

export async function requestSigningOtpAction(token: string): Promise<OtpRequestState> {
  const resolved = await resolveSigner(token);
  if (!resolved || resolved.agreement.status !== "PENDING_SIGNATURE") {
    return { ok: false, error: "This signing link is no longer valid." };
  }
  const { agreement, email } = resolved;
  if (!email) {
    return { ok: false, error: "No email on file for this signer." };
  }

  const limit = rateLimit(`otp-request:${agreement.id}:${email}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { ok: false, error: "Too many OTP requests. Please wait a few minutes." };
  }

  await issueOtp(agreement.id, email);
  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: "OTP requested", actor: email },
  });

  return { ok: true };
}

export type OtpVerifyState = { ok: boolean; error?: string };

export async function verifySigningOtpAction(token: string, code: string): Promise<OtpVerifyState> {
  const resolved = await resolveSigner(token);
  if (!resolved || !resolved.email) return { ok: false, error: "Invalid link." };
  const { agreement, email } = resolved;

  const limit = rateLimit(`otp-verify:${agreement.id}:${email}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return { ok: false, error: "Too many attempts. Please wait a few minutes." };

  const result = await verifyOtp(agreement.id, email, code);
  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "Please request a new code.",
      expired: "This code has expired. Please request a new one.",
      too_many_attempts: "Too many incorrect attempts. Please request a new code.",
      invalid_code: "Incorrect code. Please try again.",
    };
    return { ok: false, error: messages[result.reason] };
  }

  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: "OTP verified", actor: email },
  });

  return { ok: true };
}

export type SignatureSubmitState = { ok: boolean; error?: string; finalPdfAssetId?: string | null };

export async function submitCreatorSignatureAction(
  token: string,
  input: { signerName: string; method: string; signatureAsset: string },
): Promise<SignatureSubmitState> {
  const resolved = await resolveSigner(token);
  if (!resolved || resolved.agreement.status !== "PENDING_SIGNATURE") {
    return { ok: false, error: "This signing link is no longer valid." };
  }
  const { agreement, role, email } = resolved;
  if (!email) return { ok: false, error: "No email on file." };

  const otp = await prisma.otpChallenge.findFirst({
    where: { agreementId: agreement.id, signerEmail: email, verified: true },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    return { ok: false, error: "Please verify the OTP sent to your email before signing." };
  }

  await prisma.signature.create({
    data: {
      agreementId: agreement.id,
      signerType: role,
      signerName: input.signerName,
      signerEmail: email,
      method: input.method,
      signatureAsset: input.signatureAsset,
      otpVerified: true,
    },
  });

  // Legacy (non-structured) agreements only ever have two signers, so
  // "SIGNED" meaningfully means "the creator's half is done, awaiting
  // completion". Structured agreements (Brand Collaboration in
  // particular) can have three signers — an intermediate "SIGNED" status
  // would be misleading there, so they go straight from
  // PENDING_SIGNATURE to COMPLETED once every required party has signed.
  if (role === "CREATOR" && !agreement.details) {
    await prisma.agreement.update({
      where: { id: agreement.id },
      data: { status: "SIGNED", signedAt: new Date() },
    });
  }

  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: `${role === "BRAND" ? "Brand" : "Creator"} Signed`, actor: email },
  });

  if (agreement.details) {
    await tryCompleteStructuredAgreement(agreement.id);
  } else {
    await tryCompleteAgreement(agreement.id);
  }

  const updated = await prisma.agreement.findUnique({ where: { id: agreement.id }, select: { finalPdfAssetId: true } });

  return { ok: true, finalPdfAssetId: updated?.finalPdfAssetId };
}

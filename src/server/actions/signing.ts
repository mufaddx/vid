"use server";

import { prisma } from "@/lib/prisma";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { tryCompleteAgreement } from "@/server/actions/agreements";

async function getAgreementForToken(token: string) {
  return prisma.agreement.findUnique({
    where: { signingToken: token },
    include: { creator: true, brand: true, signatures: true },
  });
}

export async function recordAgreementViewedAction(token: string): Promise<void> {
  const agreement = await getAgreementForToken(token);
  if (!agreement) return;
  if (!agreement.viewedAt) {
    await prisma.agreement.update({ where: { id: agreement.id }, data: { viewedAt: new Date() } });
  }
  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: "Viewed by creator", actor: agreement.creator.email ?? "creator" },
  });
}

export type OtpRequestState = { ok: boolean; error?: string; maskedEmail?: string };

export async function requestSigningOtpAction(token: string): Promise<OtpRequestState> {
  const agreement = await getAgreementForToken(token);
  if (!agreement || agreement.status !== "PENDING_SIGNATURE") {
    return { ok: false, error: "This signing link is no longer valid." };
  }
  if (!agreement.creator.email) {
    return { ok: false, error: "No email on file for this creator." };
  }

  const limit = rateLimit(`otp-request:${agreement.id}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { ok: false, error: "Too many OTP requests. Please wait a few minutes." };
  }

  await issueOtp(agreement.id, agreement.creator.email);
  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: "OTP requested", actor: agreement.creator.email },
  });

  return { ok: true };
}

export type OtpVerifyState = { ok: boolean; error?: string };

export async function verifySigningOtpAction(token: string, code: string): Promise<OtpVerifyState> {
  const agreement = await getAgreementForToken(token);
  if (!agreement || !agreement.creator.email) return { ok: false, error: "Invalid link." };

  const limit = rateLimit(`otp-verify:${agreement.id}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return { ok: false, error: "Too many attempts. Please wait a few minutes." };

  const result = await verifyOtp(agreement.id, agreement.creator.email, code);
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
    data: { agreementId: agreement.id, event: "OTP verified", actor: agreement.creator.email },
  });

  return { ok: true };
}

export type SignatureSubmitState = { ok: boolean; error?: string; finalPdfAssetId?: string | null };

export async function submitCreatorSignatureAction(
  token: string,
  input: { signerName: string; method: string; signatureAsset: string },
): Promise<SignatureSubmitState> {
  const agreement = await getAgreementForToken(token);
  if (!agreement || agreement.status !== "PENDING_SIGNATURE") {
    return { ok: false, error: "This signing link is no longer valid." };
  }
  if (!agreement.creator.email) return { ok: false, error: "No email on file." };

  const otp = await prisma.otpChallenge.findFirst({
    where: { agreementId: agreement.id, signerEmail: agreement.creator.email, verified: true },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    return { ok: false, error: "Please verify the OTP sent to your email before signing." };
  }

  await prisma.signature.create({
    data: {
      agreementId: agreement.id,
      signerType: "CREATOR",
      signerName: input.signerName,
      signerEmail: agreement.creator.email,
      method: input.method,
      signatureAsset: input.signatureAsset,
      otpVerified: true,
    },
  });

  await prisma.agreement.update({
    where: { id: agreement.id },
    data: { status: "SIGNED", signedAt: new Date() },
  });

  await prisma.agreementAuditLog.create({
    data: { agreementId: agreement.id, event: "Creator Signed", actor: agreement.creator.email },
  });

  await tryCompleteAgreement(agreement.id);

  const updated = await prisma.agreement.findUnique({ where: { id: agreement.id }, select: { finalPdfAssetId: true } });

  return { ok: true, finalPdfAssetId: updated?.finalPdfAssetId };
}

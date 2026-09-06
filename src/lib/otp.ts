import "server-only";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { otpEmail } from "@/lib/email/templates";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function issueOtp(agreementId: string, signerEmail: string): Promise<void> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.otpChallenge.create({
    data: {
      agreementId,
      signerEmail,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendEmail({
    to: signerEmail,
    subject: "Your VIDLIX verification code",
    html: otpEmail({ code }),
    template: "otp",
  });
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "invalid_code" };

export async function verifyOtp(
  agreementId: string,
  signerEmail: string,
  code: string,
): Promise<OtpVerifyResult> {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { agreementId, signerEmail, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) return { ok: false, reason: "not_found" };
  if (challenge.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (challenge.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  if (challenge.codeHash !== hashCode(code)) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid_code" };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { verified: true },
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin panel login 2FA — same code/hash/expiry/attempt-limit mechanics as
// the e-sign OTP above, but scoped to AdminUser instead of Agreement so
// the two flows can't interfere with each other.
// ---------------------------------------------------------------------------

export async function issueAdminLoginOtp(adminId: string, email: string): Promise<void> {
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await prisma.adminLoginOtp.create({
    data: {
      adminUserId: adminId,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await sendEmail({
    to: email,
    subject: "Your VIDLIX admin login code",
    html: otpEmail({ code }),
    template: "admin_login_otp",
  });
}

export async function verifyAdminLoginOtp(adminId: string, code: string): Promise<OtpVerifyResult> {
  const challenge = await prisma.adminLoginOtp.findFirst({
    where: { adminUserId: adminId, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) return { ok: false, reason: "not_found" };
  if (challenge.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (challenge.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  if (challenge.codeHash !== hashCode(code)) {
    await prisma.adminLoginOtp.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid_code" };
  }

  await prisma.adminLoginOtp.update({
    where: { id: challenge.id },
    data: { verified: true },
  });

  return { ok: true };
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { issueAdminLoginOtp, verifyAdminLoginOtp } from "@/lib/otp";

export type LoginState =
  | { error?: string }
  | { otpRequired: true; adminId: string; maskedEmail: string }
  | undefined;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

// Step 1: password check. On success, issues an email OTP instead of
// creating a session directly — the session is only created after
// verifyAdminLoginOtpAction succeeds (step 2).
export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const limit = rateLimit(`login:${email}`, { max: 8, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.active) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await issueAdminLoginOtp(admin.id, admin.email);

  return { otpRequired: true, adminId: admin.id, maskedEmail: maskEmail(admin.email) };
}

export type OtpState = { error?: string } | undefined;

export async function resendAdminLoginOtpAction(adminId: string): Promise<OtpState> {
  const limit = rateLimit(`admin-otp-request:${adminId}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: "Too many requests. Please wait a few minutes." };
  }
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin || !admin.active) return { error: "Session expired. Please sign in again." };

  await issueAdminLoginOtp(admin.id, admin.email);
  return undefined;
}

// Step 2: verify the emailed code, then actually create the session.
export async function verifyAdminLoginOtpAction(adminId: string, code: string): Promise<OtpState> {
  const limit = rateLimit(`admin-otp-verify:${adminId}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: "Too many attempts. Please wait a few minutes." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin || !admin.active) return { error: "Session expired. Please sign in again." };

  const result = await verifyAdminLoginOtp(adminId, code);
  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "Please request a new code.",
      expired: "This code has expired. Please request a new one.",
      too_many_attempts: "Too many incorrect attempts. Please request a new code.",
      invalid_code: "Incorrect code. Please try again.",
    };
    return { error: messages[result.reason] };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(admin.id);
  redirect("/admin/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

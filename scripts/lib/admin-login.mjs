import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Shared login helper for every Playwright regression script — admin
// login is now a two-step flow (password, then an emailed OTP), so every
// script that used to do fill-email/fill-password/click/waitForURL now
// needs this instead. Reads the OTP back from the mocked EmailLog row
// (RESEND_API_KEY is unset in this dev environment, so sends are logged
// there rather than actually delivered).
export async function adminLogin(page, { email = "admin@vidlix.in", password = "vidlix@admin123", base = "http://127.0.0.1:3000" } = {}) {
  await page.goto(`${base}/admin/login`);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=We sent a 6-digit code", { timeout: 15000 });

  const otpLog = await prisma.emailLog.findFirst({
    where: { toEmail: email, template: "admin_login_otp" },
    orderBy: { createdAt: "desc" },
  });
  const code = otpLog?.body.match(/>(\d{6})</)?.[1];
  if (!code) throw new Error("adminLogin: could not retrieve OTP from EmailLog");

  await page.locator('[data-input-otp="true"]').first().click();
  await page.keyboard.type(code, { delay: 20 });
  await page.click('button:has-text("Verify & Sign In")');
  await page.waitForURL(`${base}/admin/dashboard`, { timeout: 15000 });
}

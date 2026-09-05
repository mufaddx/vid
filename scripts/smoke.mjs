import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[smoke]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  globalThis.__page = page;
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("hmr") || text.includes("WebSocket") || text.includes("React DevTools")) return;
    if (msg.type() === "error" || msg.type() === "warning") console.error(`[console:${msg.type()}]`, text);
  });

  // 1. Admin login
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", "admin@vidlix.in");
  await page.fill("#password", "vidlix@admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin/dashboard`, { timeout: 15000 });
  log("1. login OK");

  // 2. Create a new creator
  const uniqueSuffix = Date.now().toString().slice(-5);
  await page.goto(`${BASE}/admin/creators/new`);
  await page.fill("#name", `Test Creator ${uniqueSuffix}`);
  await page.fill("#category", "Beauty & Wellness");
  await page.fill("#email", `test.creator.${uniqueSuffix}@example.com`);
  await page.fill("#city", "Mumbai");
  await page.fill("#managementFee", "40000");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/creators\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const creatorId = page.url().split("/").pop();
  log("2. creator created ->", creatorId);

  // 3. Connect Instagram social account
  await page.locator('[role="tab"]', { hasText: "Social" }).click();
  await page.waitForTimeout(300);
  await page.locator('input[name="username"]').first().fill("testcreator");
  await page.locator('input[name="followers"]').first().fill("150000");
  await page.locator('button:has-text("Connect")').first().click();
  await page.waitForTimeout(1200);
  const connectedCount = await page.locator("text=CONNECTED").count();
  log("3. social connected, CONNECTED badges:", connectedCount);

  // 4. Create agreement for this creator
  await page.goto(`${BASE}/admin/agreements/new?creatorId=${creatorId}`);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const agreementId = page.url().split("/").pop();
  log("4. agreement created ->", agreementId);

  // 5. Admin signs
  await page.click('button:has-text("Sign as VIDLIX")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Type your full legal name"]', "VIDLIX Admin");
  await page.click('button:has-text("Apply Signature")');
  await page.waitForTimeout(1200);
  log("5. admin signed");

  // 6. Send for signature
  await page.click('button:has-text("Send for Signature")');
  await page.waitForTimeout(1200);
  const agreement = await prisma.agreement.findUniqueOrThrow({ where: { id: agreementId }, include: { creator: true } });
  log("6. sent for signature, status:", agreement.status, "token:", agreement.signingToken?.slice(0, 8) + "…");

  // 7. Creator opens signing link in a fresh (unauthenticated) context
  const creatorCtx = await browser.newContext();
  const signPage = await creatorCtx.newPage();
  await signPage.goto(`${BASE}/agreement/sign/${agreement.signingToken}`);
  await signPage.waitForTimeout(500);
  await signPage.click('button:has-text("Continue to Verification")');
  await signPage.waitForTimeout(300);
  await signPage.click('button:has-text("Send OTP")');
  await signPage.waitForTimeout(1500);

  const challenges = await prisma.otpChallenge.findMany({ where: { agreementId }, orderBy: { createdAt: "desc" } });
  log("   otp challenges for this agreement:", challenges.length);
  const otpLogs = await prisma.emailLog.findMany({
    where: { toEmail: agreement.creator.email, template: "otp" },
    orderBy: { createdAt: "desc" },
  });
  log("   otp emails logged:", otpLogs.length);
  const otpLog = otpLogs[0];
  const codeMatch = otpLog?.body.match(/>(\d{6})</);
  const code = codeMatch?.[1];
  log("7. OTP retrieved from mocked EmailLog:", code, "| raw snippet:", otpLog?.body.slice(0, 400));
  if (!code) throw new Error("Could not retrieve OTP from EmailLog");

  await signPage.locator('[data-input-otp="true"]').first().click();
  await signPage.keyboard.type(code, { delay: 50 });
  await signPage.waitForTimeout(300);
  await signPage.click('button:has-text("Verify")');
  await signPage.waitForTimeout(1200);
  await signPage.screenshot({ path: "/tmp/after-otp.png", fullPage: true });
  log("8. OTP verified");

  // 9. Creator e-signs
  await signPage.fill('input[placeholder="Type your full legal name"]', agreement.creator.name);
  await signPage.click('button:has-text("Apply Signature")');
  await signPage.waitForTimeout(2000);
  const completedHeading = await signPage.locator("text=Agreement Completed").count();
  log("9. creator signed, completion screen shown:", completedHeading > 0);

  const finalAgreement = await prisma.agreement.findUniqueOrThrow({ where: { id: agreementId } });
  log("   final status:", finalAgreement.status, "pdf asset:", !!finalAgreement.finalPdfAssetId);

  // 10. Download the completed PDF via the secure token link (no login)
  if (finalAgreement.finalPdfAssetId) {
    const pdfResp = await creatorCtx.request.get(
      `${BASE}/api/files/${finalAgreement.finalPdfAssetId}?token=${agreement.signingToken}`,
    );
    log("10. signed PDF download status:", pdfResp.status(), "content-type:", pdfResp.headers()["content-type"]);
  }

  // 11. Create + pay a creator management invoice
  await page.goto(`${BASE}/admin/billing/invoices/new?creatorId=${creatorId}`);
  await page.fill('textarea[name="description"]', "Creator Management Services — Test Month");
  await page.fill('#subtotal', "40000");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/billing\/invoices\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const invoiceId = page.url().split("/").pop();
  log("11. invoice created ->", invoiceId);

  await page.click('button:has-text("Record Payment")');
  await page.waitForTimeout(1500);
  const invoiceAfter = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  log("12. payment recorded, invoice status:", invoiceAfter.status, "pending:", invoiceAfter.pendingAmount.toString());

  // 13. Create + pay a payout
  await page.goto(`${BASE}/admin/billing/payouts/new?creatorId=${creatorId}`);
  await page.fill('#grossAmount', "200000");
  await page.click('button[type="submit"]');
  await page.waitForURL(new RegExp(`/admin/creators/${creatorId}$`), { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.locator('[role="tab"]', { hasText: "Billing" }).click();
  await page.waitForTimeout(500);
  await page.click('button:has-text("Mark Paid")');
  await page.waitForTimeout(1500);
  const payout = await prisma.payout.findFirst({ where: { creatorId }, orderBy: { createdAt: "desc" } });
  log("13. payout status:", payout?.status, "commission:", payout?.commissionAmount.toString(), "creatorShare:", payout?.creatorAmount.toString());

  await browser.close();
  await prisma.$disconnect();
  log("SMOKE TEST COMPLETE ✔");
}

main().catch(async (e) => {
  console.error("[smoke] FAILED", e);
  try {
    if (globalThis.__page) await globalThis.__page.screenshot({ path: "/tmp/failure.png", fullPage: true });
  } catch {}
  await prisma.$disconnect();
  process.exit(1);
});

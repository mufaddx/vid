// Regression for two related fixes:
// 1. A signer should be able to download a PDF copy immediately after
//    signing their half, even before every party has signed (previously
//    the "Download PDF" button only appeared once the agreement was fully
//    COMPLETED).
// 2. /api/agreements/[id]/pdf must accept the signer's own signing-link
//    token as an alternative to an admin session (a signer isn't logged
//    into the admin panel at all) — and must still reject a request with
//    neither a session nor a valid token.
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-signing-pdf]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await adminLogin(page, { base: BASE });
  log("admin login OK");

  const rahul = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });

  await page.goto(`${BASE}/admin/agreements/new/creator-management?creatorId=${rahul.id}`);
  await page.waitForTimeout(300);
  await page.locator('input[placeholder="Amount (₹)"]').fill("45000");
  await page.click('button:has-text("Add Service")');
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Create Agreement")').click();
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const agreementId = page.url().split("/").pop();
  log("agreement created ->", agreementId);

  await page.click('button:has-text("Sign as VIDLIX")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Type your full legal name"]', "VIDLIX Admin");
  await page.click('button:has-text("Apply Signature")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Send for Signature")');
  await page.waitForTimeout(1000);

  const agreement = await prisma.agreement.findUniqueOrThrow({ where: { id: agreementId }, include: { creator: true } });
  log("status after admin signs + sends:", agreement.status);

  // Creator signs, from a completely fresh (unauthenticated, no admin
  // session at all) browser context — this is the real external signer's
  // situation.
  const signerCtx = await browser.newContext();
  const signerPage = await signerCtx.newPage();
  await signerPage.goto(`${BASE}/agreement/sign/${agreement.signingToken}`);
  await signerPage.click('button:has-text("Continue to Verification")');
  await signerPage.click('button:has-text("Send OTP")');
  await signerPage.waitForTimeout(1500);
  const otpLog = await prisma.emailLog.findFirst({ where: { toEmail: agreement.creator.email, template: "otp" }, orderBy: { createdAt: "desc" } });
  const code = otpLog?.body.match(/>(\d{6})</)?.[1];
  if (!code) throw new Error("could not read signing OTP from EmailLog");
  await signerPage.locator('[data-input-otp="true"]').first().click();
  await signerPage.keyboard.type(code, { delay: 30 });
  await signerPage.click('button:has-text("Verify")');
  await signerPage.waitForTimeout(500);
  await signerPage.fill('input[placeholder="Type your full legal name"]', agreement.creator.name);
  await signerPage.click('button:has-text("Apply Signature")');
  await signerPage.waitForTimeout(1500);

  const doneVisible = (await signerPage.locator("text=/Signature Recorded|Agreement Completed/").count()) > 0;
  log("done screen shown:", doneVisible);

  const downloadLink = signerPage.locator('a:has-text("Download")');
  const hasDownloadLink = (await downloadLink.count()) > 0;
  const href = hasDownloadLink ? await downloadLink.getAttribute("href") : null;
  log("download link present:", hasDownloadLink, "href:", href);

  const pdfResp = href ? await signerPage.request.get(`${BASE}${href}`) : null;
  log("pdf fetch status (unauthenticated, token in URL):", pdfResp?.status());

  const noTokenResp = await signerPage.request.get(`${BASE}/api/agreements/${agreementId}/pdf`);
  log("pdf fetch with no token/session (should be 401):", noTokenResp.status());

  await signerCtx.close();

  // --- The real target scenario: an agreement that is NOT yet fully
  // completed after this signature (Brand Collaboration needs a third,
  // separate brand signature) — the download must still work here, via
  // the live-render route (no finalPdfAssetId exists yet).
  const nike = await prisma.brand.findFirstOrThrow({ where: { slug: "nike-india" } });
  await page.goto(`${BASE}/admin/agreements/new/brand-collaboration?creatorId=${rahul.id}&brandId=${nike.id}`);
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Campaign Name *"]', "Regression Test Campaign");
  await page.click('button:has-text("Add Deliverable")');
  await page.waitForTimeout(200);
  await page.locator('div:has(> div > label:text("Qty")) input[type="number"]').first().fill("1");
  await page.locator('div:has(> div > label:text("Rate (₹)")) input[type="number"]').first().fill("10000");
  await page.click('button:has-text("Create Agreement")');
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const bcId = page.url().split("/").pop();
  await page.click('button:has-text("Sign as VIDLIX")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Type your full legal name"]', "VIDLIX Admin");
  await page.click('button:has-text("Apply Signature")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Send for Signature")');
  await page.waitForTimeout(1000);

  const bc = await prisma.agreement.findUniqueOrThrow({ where: { id: bcId }, include: { creator: true } });
  const bcCtx = await browser.newContext();
  const bcPage = await bcCtx.newPage();
  await bcPage.goto(`${BASE}/agreement/sign/${bc.signingToken}`);
  await bcPage.click('button:has-text("Continue to Verification")');
  await bcPage.click('button:has-text("Send OTP")');
  await bcPage.waitForTimeout(1500);
  const bcOtpLog = await prisma.emailLog.findFirst({ where: { toEmail: bc.creator.email, template: "otp" }, orderBy: { createdAt: "desc" } });
  const bcCode = bcOtpLog?.body.match(/>(\d{6})</)?.[1];
  await bcPage.locator('[data-input-otp="true"]').first().click();
  await bcPage.keyboard.type(bcCode, { delay: 30 });
  await bcPage.click('button:has-text("Verify")');
  await bcPage.waitForTimeout(500);
  await bcPage.fill('input[placeholder="Type your full legal name"]', bc.creator.name);
  await bcPage.click('button:has-text("Apply Signature")');
  await bcPage.waitForTimeout(1500);

  const bcAfterCreator = await prisma.agreement.findUniqueOrThrow({ where: { id: bcId } });
  log("brand-collab status after ONLY creator signs (should still be PENDING_SIGNATURE):", bcAfterCreator.status, "finalPdfAssetId (should be null):", bcAfterCreator.finalPdfAssetId);

  const bcDownloadLink = bcPage.locator('a:has-text("Download")');
  const bcHasLink = (await bcDownloadLink.count()) > 0;
  const bcHref = bcHasLink ? await bcDownloadLink.getAttribute("href") : null;
  const bcPdfResp = bcHref ? await bcPage.request.get(`${BASE}${bcHref}`) : null;
  log("mid-signing download link present:", bcHasLink, "href:", bcHref, "status:", bcPdfResp?.status());

  await bcCtx.close();
  await browser.close();
  await prisma.$disconnect();

  const midSigningOk =
    bcAfterCreator.status === "PENDING_SIGNATURE" &&
    !bcAfterCreator.finalPdfAssetId &&
    bcHasLink &&
    bcHref?.includes("/api/agreements/") &&
    bcPdfResp?.status() === 200;

  const ok = doneVisible && hasDownloadLink && pdfResp?.status() === 200 && noTokenResp.status() === 401 && midSigningOk;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-signing-pdf] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

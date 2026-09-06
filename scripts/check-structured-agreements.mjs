import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("hmr") || t.includes("WebSocket") || t.includes("React DevTools")) return;
    if (msg.type() === "error") console.error("[console:error]", t);
  });

  await adminLogin(page, { base: BASE });
  log("login OK");

  const rahul = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });
  const nike = await prisma.brand.findFirstOrThrow({ where: { slug: "nike-india" } });

  // --- Legacy agreements still open fine -----------------------------
  const legacyAgreements = (await prisma.agreement.findMany()).filter((a) => !a.details);
  for (const a of legacyAgreements) {
    const resp = await page.goto(`${BASE}/admin/agreements/${a.id}`);
    log(`legacy agreement ${a.agreementNumber} -> ${resp.status()}`);
  }

  // --- Type selector ---------------------------------------------------
  await page.goto(`${BASE}/admin/agreements/new?creatorId=${rahul.id}`);
  const cmLink = page.locator('a[href*="creator-management"]');
  const bcLink = page.locator('a[href*="brand-collaboration"]');
  log("type selector shows creator-management link:", await cmLink.count(), "brand-collaboration link:", await bcLink.count());

  // --- Creator Management Agreement ------------------------------------
  await cmLink.click();
  await page.waitForURL(/creator-management/);
  await page.waitForTimeout(300);
  await page.locator('input[placeholder="Amount (₹)"]').fill("45000");
  await page.click('button:has-text("Add Service")');
  await page.waitForTimeout(200);
  await page.locator('button:has-text("Create Agreement")').click();
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const cmAgreementId = page.url().split("/").pop();
  log("creator management agreement created ->", cmAgreementId);

  const cmPdf = await page.request.get(`${BASE}/api/agreements/${cmAgreementId}/pdf`);
  log("creator management PDF status:", cmPdf.status(), "bytes:", (await cmPdf.body()).length);

  // Admin sign + send
  await page.click('button:has-text("Sign as VIDLIX")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Type your full legal name"]', "VIDLIX Admin");
  await page.click('button:has-text("Apply Signature")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Send for Signature")');
  await page.waitForTimeout(1000);

  const cmAgreement = await prisma.agreement.findUniqueOrThrow({ where: { id: cmAgreementId }, include: { creator: true } });
  log("cm status:", cmAgreement.status, "creator token:", !!cmAgreement.signingToken);

  // Creator signs
  const ctx1 = await browser.newContext();
  const p1 = await ctx1.newPage();
  await p1.goto(`${BASE}/agreement/sign/${cmAgreement.signingToken}`);
  await p1.click('button:has-text("Continue to Verification")');
  await p1.click('button:has-text("Send OTP")');
  await p1.waitForTimeout(1500);
  const otpLog1 = await prisma.emailLog.findFirst({ where: { toEmail: cmAgreement.creator.email, template: "otp" }, orderBy: { createdAt: "desc" } });
  const code1 = otpLog1?.body.match(/>(\d{6})</)?.[1];
  await p1.locator('[data-input-otp="true"]').first().click();
  await p1.keyboard.type(code1, { delay: 30 });
  await p1.click('button:has-text("Verify")');
  await p1.waitForTimeout(500);
  await p1.fill('input[placeholder="Type your full legal name"]', cmAgreement.creator.name);
  await p1.click('button:has-text("Apply Signature")');
  await p1.waitForTimeout(1500);
  const doneHeading = await p1.locator("text=Agreement Completed").count();
  log("creator management: completion screen shown:", doneHeading > 0);

  const cmFinal = await prisma.agreement.findUniqueOrThrow({ where: { id: cmAgreementId } });
  log("creator management final status:", cmFinal.status, "has pdf:", !!cmFinal.finalPdfAssetId);

  // --- Brand Collaboration Agreement -----------------------------------
  await page.goto(`${BASE}/admin/agreements/new/brand-collaboration?creatorId=${rahul.id}&brandId=${nike.id}`);
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Campaign Name *"]', "Diwali Sale Push");
  await page.click('button:has-text("Add Deliverable")');
  await page.waitForTimeout(200);
  const qtyInputs = page.locator('input[type="number"]');
  // Fill first deliverable qty/rate (they're within the deliverable row; locate via nearby label context is complex, use nth from the visible number inputs after campaign fields)
  await page.locator('div:has(> div > label:text("Qty")) input[type="number"]').first().fill("2");
  await page.locator('div:has(> div > label:text("Rate (₹)")) input[type="number"]').first().fill("15000");
  await page.click('button:has-text("Create Agreement")');
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const bcAgreementId = page.url().split("/").pop();
  log("brand collaboration agreement created ->", bcAgreementId);

  const bcPdf = await page.request.get(`${BASE}/api/agreements/${bcAgreementId}/pdf`);
  log("brand collaboration PDF status:", bcPdf.status(), "bytes:", (await bcPdf.body()).length);

  await page.click('button:has-text("Sign as VIDLIX")');
  await page.waitForTimeout(300);
  await page.fill('input[placeholder="Type your full legal name"]', "VIDLIX Admin");
  await page.click('button:has-text("Apply Signature")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Send for Signature")');
  await page.waitForTimeout(1000);

  const bcAgreement = await prisma.agreement.findUniqueOrThrow({ where: { id: bcAgreementId }, include: { creator: true, brand: true } });
  log("bc status:", bcAgreement.status, "creator token:", !!bcAgreement.signingToken, "brand token:", !!bcAgreement.brandSigningToken);

  // Creator signs
  const ctx2 = await browser.newContext();
  const p2 = await ctx2.newPage();
  await p2.goto(`${BASE}/agreement/sign/${bcAgreement.signingToken}`);
  await p2.click('button:has-text("Continue to Verification")');
  await p2.click('button:has-text("Send OTP")');
  await p2.waitForTimeout(1500);
  const otpLog2 = await prisma.emailLog.findFirst({ where: { toEmail: bcAgreement.creator.email, template: "otp" }, orderBy: { createdAt: "desc" } });
  const code2 = otpLog2?.body.match(/>(\d{6})</)?.[1];
  await p2.locator('[data-input-otp="true"]').first().click();
  await p2.keyboard.type(code2, { delay: 30 });
  await p2.click('button:has-text("Verify")');
  await p2.waitForTimeout(500);
  await p2.fill('input[placeholder="Type your full legal name"]', bcAgreement.creator.name);
  await p2.click('button:has-text("Apply Signature")');
  await p2.waitForTimeout(1000);
  log("creator signed brand collab, completed screen:", await p2.locator("text=Signature Recorded").count(), await p2.locator("text=Agreement Completed").count());

  // Brand signs
  const ctx3 = await browser.newContext();
  const p3 = await ctx3.newPage();
  await p3.goto(`${BASE}/agreement/sign/${bcAgreement.brandSigningToken}`);
  await p3.waitForTimeout(300);
  const brandBadge = await p3.locator("text=SIGNING AS BRAND").count();
  log("brand signing page shows SIGNING AS BRAND badge:", brandBadge);
  await p3.click('button:has-text("Continue to Verification")');
  await p3.click('button:has-text("Send OTP")');
  await p3.waitForTimeout(1500);
  const otpLog3 = await prisma.emailLog.findFirst({ where: { toEmail: bcAgreement.brand.email, template: "otp" }, orderBy: { createdAt: "desc" } });
  const code3 = otpLog3?.body.match(/>(\d{6})</)?.[1];
  await p3.locator('[data-input-otp="true"]').first().click();
  await p3.keyboard.type(code3, { delay: 30 });
  await p3.click('button:has-text("Verify")');
  await p3.waitForTimeout(500);
  await p3.fill('input[placeholder="Type your full legal name"]', bcAgreement.brand.contactPerson ?? bcAgreement.brand.name);
  await p3.click('button:has-text("Apply Signature")');
  await p3.waitForTimeout(1500);
  const bcDone = await p3.locator("text=Agreement Completed").count();
  log("brand signed, agreement completed:", bcDone > 0);

  const bcFinal = await prisma.agreement.findUniqueOrThrow({ where: { id: bcAgreementId } });
  log("brand collaboration final status:", bcFinal.status, "has pdf:", !!bcFinal.finalPdfAssetId);

  // --- Agreements list shows type + relationship -----------------------
  await page.goto(`${BASE}/admin/agreements`);
  await page.waitForTimeout(500);
  const listText = await page.locator("body").innerText();
  log("list shows Nike × VIDLIX × Rahul relationship:", listText.includes("Nike India") && listText.includes("VIDLIX") && listText.includes("Rahul Sharma"));

  await browser.close();
  await prisma.$disconnect();
  log("ALL CHECKS COMPLETE ✔");
}

main().catch(async (e) => {
  console.error("[check] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

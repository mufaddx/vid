import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await adminLogin(page, { base: BASE });

  const creator = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });

  // Reuse an existing draft agreement for rahul if present, else create one.
  let agreement = await prisma.agreement.findFirst({ where: { creatorId: creator.id, status: "DRAFT" } });
  if (!agreement) {
    // /admin/agreements/new is now just the type-selector cards (no form) —
    // the actual legacy/custom form with a submit button lives one level
    // deeper, at /admin/agreements/new/custom (see NewAgreementDialog).
    await page.goto(`${BASE}/admin/agreements/new/custom?creatorId=${creator.id}`);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  } else {
    await page.goto(`${BASE}/admin/agreements/${agreement.id}`);
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/letterhead-editor.png", fullPage: true });

  const url = page.url();
  const agreementId = url.split("/").pop();

  // Download the live-preview PDF and save it.
  const resp = await page.request.get(`${BASE}/api/agreements/${agreementId}/pdf`);
  const buf = await resp.body();
  const fs = await import("fs");
  fs.writeFileSync("/tmp/letterhead-preview.pdf", buf);
  console.log("PDF bytes:", buf.length, "status:", resp.status());

  // Also check the creator detail page's sticky header + colorful admin theme.
  await page.goto(`${BASE}/admin/creators/${creator.id}`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/creator-sticky-top.png" });
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/creator-sticky-scrolled.png" });

  await browser.close();
  await prisma.$disconnect();
  console.log("done");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});

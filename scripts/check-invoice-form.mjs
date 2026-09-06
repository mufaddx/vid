import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-invoice]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  await page.goto(`${BASE}/admin/billing/invoices/new`);

  // Default type is Creator Management — Brand/Campaign selects must NOT
  // be present at all (this was the reported bug: they always showed).
  const brandSelectCountDefault = await page.locator('text=Brand *').count();
  log("Brand field shown by default (should be 0):", brandSelectCountDefault);

  // Live preview should reflect the Creator Management label.
  const previewTitleCreator = await page.locator("text=CREATOR MANAGEMENT INVOICE").count();
  log("preview shows CREATOR MANAGEMENT INVOICE:", previewTitleCreator > 0);

  // Switch to Brand Collaboration Invoice — Brand/Campaign fields must appear.
  await page.locator('form [role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("Brand Collaboration Invoice")').click();
  const brandSelectCountAfter = await page.locator('text=Brand *').count();
  log("Brand field shown after switching to Brand Collaboration (should be 1):", brandSelectCountAfter);
  const previewTitleBrand = await page.locator("text=BRAND COLLABORATION INVOICE").count();
  log("preview updates to BRAND COLLABORATION INVOICE:", previewTitleBrand > 0);

  // Type a description and amount, verify live preview updates without reload.
  await page.fill("#description", "Diwali Campaign Package");
  await page.fill("#subtotal", "50000");
  await page.waitForTimeout(200);
  const previewShowsDescription = await page.locator("text=Diwali Campaign Package").count();
  const previewShowsAmount = await page.locator("text=₹50,000").count();
  log("live preview reflects description:", previewShowsDescription > 0, "| amount:", previewShowsAmount > 0);

  // Switch back to Creator Management — Brand/Campaign fields must disappear again.
  await page.locator('form [role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("Creator Management Invoice")').click();
  const brandSelectCountBack = await page.locator('text=Brand *').count();
  log("Brand field hidden again after switching back (should be 0):", brandSelectCountBack);

  // Actually submit a Creator Management invoice end-to-end.
  await page.locator('form [role="combobox"]').nth(1).click(); // creator select
  await page.locator('[role="option"]').first().click();
  await page.click('button[type="submit"]:has-text("Create Invoice")');
  await page.waitForURL(/\/admin\/billing\/invoices\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const invoiceId = page.url().split("/").pop();
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  log("invoice created ->", invoiceId, "| type:", invoice.invoiceType, "| brandId (should be null):", invoice.brandId);

  await browser.close();
  await prisma.$disconnect();

  const ok =
    brandSelectCountDefault === 0 &&
    previewTitleCreator > 0 &&
    brandSelectCountAfter === 1 &&
    previewTitleBrand > 0 &&
    previewShowsDescription > 0 &&
    previewShowsAmount > 0 &&
    brandSelectCountBack === 0 &&
    invoice.invoiceType === "CREATOR_MANAGEMENT" &&
    invoice.brandId === null;

  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-invoice] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

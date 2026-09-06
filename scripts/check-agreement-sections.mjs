import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-sections]", ...a);

// A long paragraph used to force real overflow onto additional PDF pages.
const LONG_PARA = Array.from({ length: 40 }, (_, i) => `Clause ${i + 1}: this is a long filler sentence to force page overflow in the generated PDF document for regression testing purposes.`).join(" ");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- New Agreement modal: kickoff flow for Creator Management ---
  await page.goto(`${BASE}/admin/agreements`);
  await page.click('button:has-text("New Agreement")');
  await page.click('text=Creator / Influencer Management Agreement');
  await page.locator('[role="dialog"] [role="combobox"]').first().click();
  await page.locator('[role="option"]').first().click();
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/\/admin\/agreements\/new\/creator-management/, { timeout: 10000 });
  log("New Agreement modal -> creator-management kickoff navigated OK:", page.url().includes("creator-management"));

  // --- Add many custom sections with long content, save, check PDF pages ---
  for (let i = 0; i < 3; i++) {
    await page.click('button:has-text("Add Section")');
  }
  const headings = await page.locator('input[placeholder="Section Heading"]').all();
  const bodies = await page.locator('textarea[placeholder="Section content…"]').all();
  const labels = ["Payment Terms", "Content Usage Rights", "Termination Conditions"];
  for (let i = 0; i < headings.length; i++) {
    await headings[i].fill(labels[i] ?? `Section ${i + 1}`);
    await bodies[i].fill(`${LONG_PARA}\n\n${LONG_PARA}`);
  }
  await page.click('button:has-text("Create Agreement")');
  await page.waitForURL(/\/admin\/agreements\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  const agreementId = page.url().split("/").pop();
  log("agreement with custom sections created ->", agreementId);

  const agreement = await prisma.agreement.findUniqueOrThrow({ where: { id: agreementId } });
  const details = agreement.details;
  log("customSections saved count:", details?.customSections?.length ?? 0);

  const resp = await page.request.get(`${BASE}/api/agreements/${agreementId}/pdf`);
  const buf = Buffer.from(await resp.body());
  const text = buf.toString("latin1");
  // A crude but reliable multi-page signal: react-pdf/pdf-lib emits one
  // "/Type /Page" object per physical page (not "/Pages", the page tree
  // root) — count occurrences with the trailing space+slash to disambiguate.
  const pageObjectMatches = text.match(/\/Type\s*\/Page[^s]/g) || [];
  log("PDF status:", resp.status(), "bytes:", buf.length, "page objects found:", pageObjectMatches.length);
  const isMultiPage = pageObjectMatches.length > 1;
  log(isMultiPage ? "MULTI-PAGE CONFIRMED ✔" : "WARNING: could not confirm multiple pages");

  // --- New Agreement modal: kickoff flow for Brand Collaboration ---
  await page.goto(`${BASE}/admin/agreements`);
  await page.click('button:has-text("New Agreement")');
  await page.click('text=Brand Collaboration Agreement');
  const bcSelects = page.locator('[role="dialog"] [role="combobox"]');
  await bcSelects.nth(0).click();
  await page.locator('[role="option"]').first().click();
  await bcSelects.nth(1).click();
  await page.locator('[role="option"]').first().click();
  await page.click('button:has-text("Continue")');
  await page.waitForURL(/\/admin\/agreements\/new\/brand-collaboration/, { timeout: 10000 });
  log("New Agreement modal -> brand-collaboration kickoff navigated OK:", page.url().includes("brand-collaboration"));

  // --- New Agreement modal: Custom type, full form inside the modal ---
  await page.goto(`${BASE}/admin/agreements`);
  await page.click('button:has-text("New Agreement")');
  await page.click('text=Custom / Other');
  const customDialogVisible = (await page.locator('[role="dialog"] button:has-text("Generate Agreement")').count()) > 0;
  log("Custom agreement form rendered inside modal:", customDialogVisible);

  await browser.close();
  await prisma.$disconnect();
  if (!isMultiPage || !customDialogVisible) process.exit(1);
  log("ALL CHECKS COMPLETE ✔");
}

main().catch(async (e) => {
  console.error("[check-sections] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

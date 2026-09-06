import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-layout]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- Logout lives in the sidebar bottom, not the top header ---
  await page.goto(`${BASE}/admin/dashboard`);
  const sidebarLogoutVisible = (await page.locator('aside button:has-text("Logout")').count()) > 0;
  const headerLogoutGone = (await page.locator('div:has(> span:has-text("VIDLIX Admin Panel")) button:has-text("Logout")').count()) === 0;
  log("Logout button in sidebar:", sidebarLogoutVisible, "| top header Logout removed:", headerLogoutGone);

  // --- Settings tab content is centered (has mx-auto, not flush left) ---
  await page.goto(`${BASE}/admin/settings`);
  const settingsBox = await page.locator('[data-slot="tabs"]').first().boundingBox();
  const viewportWidth = 1440;
  const sidebarWidth = 256; // w-64
  const contentAreaWidth = viewportWidth - sidebarWidth;
  const contentAreaCenterX = sidebarWidth + contentAreaWidth / 2;
  const settingsCenterX = settingsBox ? settingsBox.x + settingsBox.width / 2 : 0;
  const centeredWithinTolerance = Math.abs(settingsCenterX - contentAreaCenterX) < 40;
  log("settings tabs center x:", settingsCenterX.toFixed(0), "| content area center x:", contentAreaCenterX.toFixed(0), "| centered:", centeredWithinTolerance);

  // --- Invoice recipient email is editable and overridable ---
  await page.goto(`${BASE}/admin/billing/invoices/new`);
  await page.locator('form [role="combobox"]').nth(1).click();
  await page.locator('[role="option"]').first().click();
  await page.waitForTimeout(300);
  const autoFilled = await page.inputValue("#recipientEmail");
  await page.fill("#recipientEmail", "manual.override@example.com");
  await page.fill("#description", "Recipient override test");
  await page.fill("#subtotal", "1000");
  await page.click('button[type="submit"]:has-text("Create Invoice")');
  try {
    await page.waitForURL(/\/admin\/billing\/invoices\/(?!new)[a-z0-9]+$/i, { timeout: 15000 });
  } catch {
    await page.screenshot({ path: "/tmp/invoice-recipient-fail.png", fullPage: true });
    console.error("invoice create did not navigate, current url:", page.url());
    throw new Error("invoice create failed");
  }
  const invoiceId = page.url().split("/").pop();
  const emailLog = await prisma.emailLog.findFirst({
    where: { toEmail: "manual.override@example.com", subject: { contains: "Invoice" } },
    orderBy: { createdAt: "desc" },
  });
  log("recipient auto-filled from creator (may be empty if no email on file):", JSON.stringify(autoFilled));
  log("invoice created:", invoiceId, "| email sent to manual override address:", !!emailLog);

  await browser.close();
  await prisma.$disconnect();

  const ok = sidebarLogoutVisible && headerLogoutGone && centeredWithinTolerance && !!emailLog;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-layout] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

import { chromium } from "playwright";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const log = (...a) => console.log("[smoke2]", ...a);

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

  const adminPages = [
    "/admin/creators",
    "/admin/brands",
    "/admin/brands/new",
    "/admin/campaigns",
    "/admin/campaigns/new",
    "/admin/collaborations",
    "/admin/agreements",
    "/admin/billing",
    "/admin/inbox",
    "/admin/email-accounts",
    "/admin/inquiries",
    "/admin/documents",
    "/admin/reports",
    "/admin/notifications",
    "/admin/settings",
  ];
  for (const path of adminPages) {
    const resp = await page.goto(`${BASE}${path}`);
    log(path, "->", resp.status());
  }

  // Brand creation — via the "Add Brand" popup on the list page
  await page.goto(`${BASE}/admin/brands`);
  const brandName = `Test Brand Co ${Date.now().toString().slice(-5)}`;
  await page.click('button:has-text("Add Brand")');
  await page.fill("#name", brandName);
  await page.fill("#industry", "FMCG");
  await page.locator('form button[type="submit"]:has-text("Add Brand")').click();
  await page.waitForTimeout(1000);
  const brandRowVisible = (await page.locator(`text=${brandName}`).count()) > 0;
  log("brand created via modal, row visible:", brandRowVisible, "| stayed on list:", page.url() === `${BASE}/admin/brands`);
  if (!brandRowVisible) await page.screenshot({ path: "/tmp/brand-fail.png", fullPage: true });

  // Inbox thread
  await page.goto(`${BASE}/admin/inbox`);
  const threadLink = page.locator("a").filter({ hasText: "Nike Summer Campaign" }).first();
  if (await threadLink.count()) {
    await threadLink.click();
    await page.waitForTimeout(500);
    await page.fill('textarea[name="body"]', "Thanks, sharing the draft shortly.");
    await page.click('button:has-text("Send Reply")');
    await page.waitForTimeout(800);
    log("inbox reply sent, url:", page.url());
  } else {
    log("no seeded thread found (ok if DB was reset)");
  }

  // Settings update
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#tagline", "CREATORS • BRANDS • BEYOND");
  await page.click('button:has-text("Save Settings")');
  await page.waitForTimeout(800);
  const saved = await page.locator("text=Settings saved.").count();
  log("settings saved confirmation shown:", saved > 0);

  // Public inquiry forms
  await page.goto(`${BASE}/creator-inquiry`);
  await page.fill('input[name="fullName"]', "Test Applicant");
  await page.fill('input[name="email"]', `applicant.${Date.now()}@example.com`);
  await page.fill('input[name="phone"]', "9999999999");
  await page.click('button:has-text("Submit Application")');
  await page.waitForURL(/\/creator-inquiry\/received$/, { timeout: 10000 });
  log("creator inquiry submitted ->", page.url());

  await page.goto(`${BASE}/brand-inquiry`);
  await page.fill('input[name="brandName"]', "Test Brand Inquiry Co");
  await page.fill('input[name="contactPerson"]', "Jane Doe");
  await page.fill('input[name="email"]', `brand.${Date.now()}@example.com`);
  await page.fill('input[name="phone"]', "8888888888");
  await page.fill('input[name="campaignName"]', "Diwali Push");
  await page.fill('textarea[name="campaignDescription"]', "A festive campaign.");
  await page.click('button:has-text("Submit Collaboration Request")');
  await page.waitForURL(/\/brand-inquiry\/received$/, { timeout: 10000 });
  log("brand inquiry submitted ->", page.url());

  // Verify inquiries now show in admin
  await page.goto(`${BASE}/admin/inquiries`);
  const newBadgeCount = await page.locator("text=NEW").count();
  log("admin inquiries page shows NEW entries:", newBadgeCount);

  await browser.close();
  log("SMOKE2 COMPLETE ✔");
}

main().catch(async (e) => {
  console.error("[smoke2] FAILED", e);
  process.exit(1);
});

import { chromium } from "playwright";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const log = (...a) => console.log("[check-modals]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- Add Creator modal ---
  await page.goto(`${BASE}/admin/creators`);
  await page.click('button:has-text("Add Creator")');
  await page.waitForTimeout(300);
  const uniq = Date.now().toString().slice(-6);
  await page.fill("#name", `Modal Creator ${uniq}`);
  await page.fill("#email", `modal.creator.${uniq}@example.com`);
  await page.click('button:has-text("Create Creator")');
  await page.waitForTimeout(1200);
  const dialogGoneCreator = (await page.locator('[role="dialog"]').count()) === 0;
  const rowExistsCreator = (await page.locator(`text=Modal Creator ${uniq}`).count()) > 0;
  log("creator modal closed:", dialogGoneCreator, "| row visible without navigation:", rowExistsCreator, "| url unchanged:", page.url() === `${BASE}/admin/creators`);

  // --- Add Brand modal ---
  await page.goto(`${BASE}/admin/brands`);
  await page.click('button:has-text("Add Brand")');
  await page.waitForTimeout(300);
  await page.fill("#name", `Modal Brand ${uniq}`);
  await page.locator('form button[type="submit"]:has-text("Add Brand")').click();
  await page.waitForTimeout(1200);
  const dialogGoneBrand = (await page.locator('[role="dialog"]').count()) === 0;
  const rowExistsBrand = (await page.locator(`text=Modal Brand ${uniq}`).count()) > 0;
  log("brand modal closed:", dialogGoneBrand, "| row visible without navigation:", rowExistsBrand, "| url unchanged:", page.url() === `${BASE}/admin/brands`);

  // --- New Campaign modal ---
  await page.goto(`${BASE}/admin/campaigns`);
  await page.click('button:has-text("New Campaign")');
  await page.waitForTimeout(300);
  // Select the brand we just created via Radix Select
  await page.locator('form [role="combobox"]').first().click();
  await page.locator(`[role="option"]:has-text("Modal Brand ${uniq}")`).click();
  await page.fill("#name", `Modal Campaign ${uniq}`);
  await page.locator('form button[type="submit"]:has-text("Create Campaign")').click();
  await page.waitForTimeout(1200);
  const dialogGoneCampaign = (await page.locator('[role="dialog"]').count()) === 0;
  const rowExistsCampaign = (await page.locator(`text=Modal Campaign ${uniq}`).count()) > 0;
  log("campaign modal closed:", dialogGoneCampaign, "| row visible without navigation:", rowExistsCampaign, "| url unchanged:", page.url() === `${BASE}/admin/campaigns`);

  // --- /new routes should redirect harmlessly, not 500 ---
  for (const path of ["/admin/creators/new", "/admin/brands/new", "/admin/campaigns/new"]) {
    const resp = await page.goto(`${BASE}${path}`);
    log(path, "-> status", resp.status(), "final url", page.url());
  }

  await browser.close();
  const allOk =
    dialogGoneCreator && rowExistsCreator &&
    dialogGoneBrand && rowExistsBrand &&
    dialogGoneCampaign && rowExistsCampaign;
  log(allOk ? "ALL MODAL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!allOk) process.exit(1);
}

main().catch((e) => {
  console.error("[check-modals] FAILED", e);
  process.exit(1);
});

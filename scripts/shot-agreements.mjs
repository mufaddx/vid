import { chromium } from "playwright";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await adminLogin(page, { base: BASE });

  await page.goto(`${BASE}/admin/agreements/new`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/shot-type-selector.png" });

  await page.goto(`${BASE}/admin/agreements`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/shot-agreements-list.png" });

  const link = page.locator('a:has-text("Open")').first();
  await link.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/shot-agreement-detail.png", fullPage: true });

  await browser.close();
  console.log("done");
}

main();

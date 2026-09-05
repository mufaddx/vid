import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${BASE}/`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/shot-home.png" });

  await page.goto(`${BASE}/creators/rahul-sharma`);
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/shot-profile.png", fullPage: true });

  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", "admin@vidlix.in");
  await page.fill("#password", "vidlix@admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE}/admin/dashboard`, { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/shot-dashboard.png" });

  await page.goto(`${BASE}/admin/creators`);
  await page.waitForTimeout(600);
  await page.locator('a:has-text("View")').first().click();
  await page.waitForURL(/\/admin\/creators\/[a-z0-9]+$/i, { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/shot-creator-detail.png" });

  await browser.close();
  console.log("done");
}

main();

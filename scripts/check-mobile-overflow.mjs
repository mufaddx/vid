import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";
const WIDTHS = [320, 360, 375, 390, 412, 430];

async function checkPage(browser, path, width) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const result = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  const overflow = result.scrollWidth > result.clientWidth;
  console.log(`[${width}px] ${path} -> scrollWidth=${result.scrollWidth} clientWidth=${result.clientWidth} ${overflow ? "❌ OVERFLOW" : "✓ ok"}`);
  await page.close();
  return !overflow;
}

async function main() {
  const browser = await chromium.launch();
  const pages = ["/", "/about", "/contact", "/blog", "/faq", "/how-it-works", "/creators", "/legal"];
  let allOk = true;
  for (const path of pages) {
    for (const width of WIDTHS) {
      const ok = await checkPage(browser, path, width);
      if (!ok) allOk = false;
    }
  }
  await browser.close();
  console.log(allOk ? "\n✔ NO OVERFLOW DETECTED ANYWHERE" : "\n❌ OVERFLOW FOUND");
  process.exit(allOk ? 0 : 1);
}

main();

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";
import path from "path";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-add-creator-photo]", ...a);
const TEST_IMAGE = path.join(process.cwd(), "public", "logo.png");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- Flow 1: create + upload a photo in the same modal session ---
  await page.goto(`${BASE}/admin/creators`);
  await page.click('button:has-text("Add Creator")');
  await page.waitForTimeout(300);
  const uniq1 = Date.now().toString().slice(-6);
  await page.fill("#name", `Photo Flow Creator ${uniq1}`);
  await page.fill("#email", `photo.flow.${uniq1}@example.com`);
  await page.click('button:has-text("Create Creator")');

  await page.waitForSelector("text=Add a Photo", { timeout: 8000 });
  log("dialog transitioned to Add a Photo step");

  await page.setInputFiles('input[type="file"]', TEST_IMAGE);
  await page.waitForSelector("text=Zoom", { timeout: 10000 });
  log("crop UI loaded inside Add Creator dialog");

  await page.click('button:has-text("Save Photo")');
  // Uploads two images to R2 (avatar + card) before the dialog closes —
  // a real network round-trip now, not an instant local write.
  await page.waitForSelector('[role="dialog"]', { state: "detached", timeout: 10000 }).catch(() => {});

  const dialogGoneAfterSave = (await page.locator('[role="dialog"]').count()) === 0;
  const creator1 = await prisma.creator.findFirstOrThrow({ where: { name: `Photo Flow Creator ${uniq1}` } });
  log("dialog closed after save:", dialogGoneAfterSave);
  log("profileImage set:", creator1.profileImage, "cardImage set:", creator1.cardImage);

  // --- Flow 2: create + Skip for now ---
  await page.goto(`${BASE}/admin/creators`);
  await page.click('button:has-text("Add Creator")');
  await page.waitForTimeout(300);
  const uniq2 = Date.now().toString().slice(-6) + "b";
  await page.fill("#name", `Skip Flow Creator ${uniq2}`);
  await page.fill("#email", `skip.flow.${uniq2}@example.com`);
  await page.click('button:has-text("Create Creator")');

  await page.waitForSelector("text=Add a Photo", { timeout: 8000 });
  await page.click('button:has-text("Skip for now")');
  await page.waitForTimeout(1000);

  const dialogGoneAfterSkip = (await page.locator('[role="dialog"]').count()) === 0;
  const creator2 = await prisma.creator.findFirstOrThrow({ where: { name: `Skip Flow Creator ${uniq2}` } });
  log("dialog closed after skip:", dialogGoneAfterSkip);
  log("creator2 created despite skip, profileImage:", creator2.profileImage);

  await browser.close();
  await prisma.$disconnect();

  const ok =
    dialogGoneAfterSave &&
    !!creator1.profileImage && !!creator1.cardImage &&
    dialogGoneAfterSkip &&
    !!creator2.id && !creator2.profileImage;

  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-add-creator-photo] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

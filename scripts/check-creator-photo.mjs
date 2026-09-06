import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";
import path from "path";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-photo]", ...a);
const TEST_IMAGE = path.join(process.cwd(), "public", "logo.png");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  await adminLogin(page, { base: BASE });
  log("login OK");

  const creator = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });
  await page.goto(`${BASE}/admin/creators/${creator.id}`);

  await page.click('button[title="Edit photo"]');
  await page.setInputFiles('input[type="file"]', TEST_IMAGE);
  await page.waitForSelector("text=Zoom", { timeout: 10000 });
  log("crop UI loaded with avatar + card preview frames");

  // Drag the avatar preview a bit, adjust zoom, then save.
  const avatarFrame = page.locator("text=Avatar").locator("..").locator("div").first();
  const box = await avatarFrame.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 15, box.y + box.height / 2 + 10, { steps: 5 });
    await page.mouse.up();
  }
  await page.fill('input[type="range"]', "1.4");

  await page.click('button:has-text("Save Photo")');
  await page.waitForTimeout(1500);

  const updated = await prisma.creator.findUniqueOrThrow({ where: { id: creator.id } });
  log("profileImage set:", updated.profileImage);
  log("cardImage set:", updated.cardImage);

  const avatarResp = await page.request.get(`${BASE}${updated.profileImage}`);
  const cardResp = await page.request.get(`${BASE}${updated.cardImage}`);
  log("avatar image status:", avatarResp.status(), "content-type:", avatarResp.headers()["content-type"], "cache-control:", avatarResp.headers()["cache-control"]);
  log("card image status:", cardResp.status(), "content-type:", cardResp.headers()["content-type"]);

  // No-auth check: a fresh unauthenticated context should still load it (public route).
  const anonCtx = await browser.newContext();
  const anonPage = await anonCtx.newPage();
  const anonResp = await anonPage.request.get(`${BASE}${updated.profileImage}`);
  log("avatar image accessible with NO session (public route):", anonResp.status());

  // Confirm it shows up across the app without further code changes.
  await page.goto(`${BASE}/admin/creators`);
  await page.waitForTimeout(800);
  let imgSrcs = await page.locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
  log("admin creators list <img> srcs:", imgSrcs);
  const listShowsPhoto = imgSrcs.includes(updated.profileImage);
  log("shows on admin creators list:", listShowsPhoto);

  await page.goto(`${BASE}/creators/${creator.slug}`);
  await page.waitForTimeout(800);
  imgSrcs = await page.locator("img").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
  log("public profile <img> srcs:", imgSrcs);
  const publicProfileShowsPhoto = imgSrcs.includes(updated.profileImage);
  log("shows on public creator profile:", publicProfileShowsPhoto);

  await page.goto(`${BASE}/creators`);
  const publicCardShowsImage = (await page.locator(`img[src="${updated.cardImage}"]`).count()) > 0;
  log("public creator card uses cardImage:", publicCardShowsImage);

  await anonCtx.close();
  await browser.close();
  await prisma.$disconnect();

  const ok =
    !!updated.profileImage && !!updated.cardImage &&
    avatarResp.status() === 200 && cardResp.status() === 200 &&
    anonResp.status() === 200 &&
    listShowsPhoto && publicProfileShowsPhoto && publicCardShowsImage;

  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-photo] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

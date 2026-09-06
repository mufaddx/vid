import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-email-search]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- hello@vidlix.in is a real, visible mailbox ---
  const helloAccount = await prisma.creatorEmailAccount.findUnique({ where: { emailAddress: "hello@vidlix.in" } });
  log("hello@vidlix.in exists in DB:", !!helloAccount, "| creatorId (should be null):", helloAccount?.creatorId);

  await page.goto(`${BASE}/admin/email-accounts`);
  const helloRowVisible = (await page.locator("text=hello@vidlix.in").count()) > 0;
  log("hello@vidlix.in visible on Email Accounts page:", helloRowVisible);

  // --- Search by email ---
  await page.fill('input[placeholder*="Search"]', "hello");
  await page.waitForTimeout(200);
  const searchByEmailWorks = (await page.locator("text=hello@vidlix.in").count()) > 0;
  const rowCountAfterSearch = await page.locator('div:has-text("@vidlix.in")').count();
  log("search by email substring 'hello' finds hello@vidlix.in:", searchByEmailWorks);

  // --- Search by creator name ---
  await page.fill('input[placeholder*="Search"]', "");
  const rahul = await prisma.creator.findFirst({ where: { slug: "rahul-sharma" } });
  if (rahul) {
    await page.fill('input[placeholder*="Search"]', "Rahul");
    await page.waitForTimeout(200);
    const searchByCreatorWorks = (await page.locator("text=rahul@vidlix.in").count()) > 0;
    const helloHiddenDuringCreatorSearch = (await page.locator("text=hello@vidlix.in").count()) === 0;
    log("search by creator name 'Rahul' finds rahul@vidlix.in:", searchByCreatorWorks, "| unrelated hello@ hidden:", helloHiddenDuringCreatorSearch);
  }
  await page.fill('input[placeholder*="Search"]', "");

  // --- View Mail navigates to the filtered inbox ---
  await page.click('a:has-text("View Mail") >> nth=0');
  await page.waitForURL(/\/admin\/inbox\?mailbox=/, { timeout: 10000 });
  const filteredUrl = page.url();
  const mailboxIdFromUrl = new URL(filteredUrl).searchParams.get("mailbox");
  log("View Mail navigated to filtered inbox:", filteredUrl);

  // --- Inbox mailbox filter narrows threads, "All" restores unified view ---
  const account = await prisma.creatorEmailAccount.findUnique({ where: { id: mailboxIdFromUrl } });
  const bannerShown = (await page.locator(`text=Mailbox: ${account.emailAddress}`).count()) > 0;
  log("inbox shows 'Mailbox: x' banner when filtered:", bannerShown);

  // Reload to confirm the filter persists across a hard refresh (URL-driven).
  await page.reload();
  const bannerPersistsAfterReload = (await page.locator(`text=Mailbox: ${account.emailAddress}`).count()) > 0;
  log("mailbox filter persists after hard refresh:", bannerPersistsAfterReload);

  await page.goto(`${BASE}/admin/inbox`);
  const unifiedBannerGone = (await page.locator("text=Mailbox:").count()) === 0;
  log("'All Email Accounts' restores unified inbox (no mailbox banner):", unifiedBannerGone);

  await browser.close();
  await prisma.$disconnect();

  const ok = !!helloAccount && helloAccount.creatorId === null && helloRowVisible && searchByEmailWorks && bannerShown && bannerPersistsAfterReload && unifiedBannerGone;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-email-search] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

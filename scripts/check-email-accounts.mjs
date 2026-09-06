import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";
import path from "path";
import fs from "fs";
import os from "os";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-email-accounts]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- Standalone mailbox creation (no creator required first) ---
  const uniq = Date.now().toString().slice(-6);
  const localPart = `standalone${uniq}`;
  await page.goto(`${BASE}/admin/email-accounts`);
  await page.click('button:has-text("Add Email Account")');
  await page.fill('input[name="localPart"]', localPart);
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForTimeout(1000);
  const rowVisible = (await page.locator(`text=${localPart}@vidlix.in`).count()) > 0;
  const standaloneLabelVisible = (await page.locator("text=Standalone mailbox").count()) > 0;
  log("standalone mailbox created, row visible:", rowVisible, "| shows 'Standalone mailbox':", standaloneLabelVisible);

  const account = await prisma.creatorEmailAccount.findUniqueOrThrow({ where: { emailAddress: `${localPart}@vidlix.in` } });
  log("DB row creatorId (should be null):", account.creatorId);

  // --- Compose is now usable (mailbox exists, no creator involved) ---
  const tmpPdf = path.join(os.tmpdir(), `test-attachment-${uniq}.pdf`);
  fs.writeFileSync(tmpPdf, "%PDF-1.4\n%mock pdf content for attachment test\n%%EOF");

  await page.goto(`${BASE}/admin/inbox`);
  const composeDisabled = await page.locator('button:has-text("Compose")').isDisabled();
  log("Compose button enabled (should be true now that a mailbox exists):", !composeDisabled);

  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (msg) => { if (msg.type() === "error") console.error("[console:error]", msg.text()); });

  await page.click('button:has-text("Compose")');
  await page.locator('[role="dialog"] [role="combobox"]').click();
  await page.locator(`[role="option"]:has-text("${localPart}@vidlix.in")`).click();
  await page.fill('input[name="to"]', "arbitrary.recipient@example.com");
  await page.fill('input[name="subject"]', "Test subject with attachment");
  await page.fill('textarea[name="body"]', "Test message body.");
  await page.setInputFiles('input[name="attachments"]', tmpPdf);
  await page.click('button[type="submit"]:has-text("Send")');
  try {
    await page.waitForURL(/\/admin\/inbox\/[a-z0-9]+$/i, { timeout: 10000 });
  } catch (e) {
    await page.screenshot({ path: "/tmp/compose-fail.png", fullPage: true });
    console.error("compose did not navigate, current url:", page.url());
    throw e;
  }
  log("compose sent, navigated to thread:", page.url());

  const thread = await prisma.emailThread.findFirst({
    where: { subject: "Test subject with attachment" },
    include: { messages: true },
    orderBy: { createdAt: "desc" },
  });
  log("thread created:", !!thread, "| message count:", thread?.messages.length);

  const emailLog = await prisma.emailLog.findFirst({
    where: { subject: "Test subject with attachment" },
    orderBy: { createdAt: "desc" },
  });
  log("email log records attachment filename:", emailLog?.body.includes("test-attachment") || emailLog?.body.includes(".pdf"));

  fs.unlinkSync(tmpPdf);
  await browser.close();
  await prisma.$disconnect();

  const ok = rowVisible && standaloneLabelVisible && account.creatorId === null && !composeDisabled && !!thread;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-email-accounts] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

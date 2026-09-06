import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-email-sender-name]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  await adminLogin(page, { base: BASE });
  log("login OK");

  // --- 1. Standalone mailbox with a Name field ---
  await page.goto(`${BASE}/admin/email-accounts`);
  await page.click('button:has-text("Add Email Account")');
  await page.waitForTimeout(300);
  const uniq = Date.now().toString().slice(-6);
  const localPart = `sender${uniq}`;
  await page.fill('input[name="localPart"]', localPart);
  await page.fill('input[name="displayName"]', "VIDLIX Partnerships");
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(1000);

  const account = await prisma.creatorEmailAccount.findUniqueOrThrow({
    where: { emailAddress: `${localPart}@vidlix.in` },
  });
  log("standalone account displayName saved:", account.displayName);

  // Compose a mail from it and check the resulting EmailLog "from" header.
  await page.goto(`${BASE}/admin/inbox`);
  await page.click('button:has-text("Compose")');
  await page.waitForTimeout(300);
  // Select the new mailbox in the compose "From" select if present.
  const fromSelectTrigger = page.locator('[role="dialog"] [role="combobox"]').first();
  if ((await fromSelectTrigger.count()) > 0) {
    await fromSelectTrigger.click();
    await page.locator(`[role="option"]:has-text("${localPart}@vidlix.in")`).click();
  }
  await page.fill('input[name="to"]', "external.recipient@example.com");
  await page.fill('input[name="subject"]', `Sender name test ${uniq}`);
  await page.fill('textarea[name="body"]', "Testing sender display name.");
  await page.click('[role="dialog"] button[type="submit"]');
  await page.waitForTimeout(1200);

  const log1 = await prisma.emailLog.findFirst({
    where: { subject: `Sender name test ${uniq}` },
    orderBy: { createdAt: "desc" },
  });
  log("standalone compose EmailLog.fromEmail:", log1?.fromEmail);
  const standaloneFromOk = !!log1?.fromEmail?.includes('"VIDLIX Partnerships"') && log1.fromEmail.includes(`${localPart}@vidlix.in`);

  // --- 2. Creator-owned mailbox reply shows the creator's real name ---
  const creator = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });
  let creatorAccount = await prisma.creatorEmailAccount.findFirst({ where: { creatorId: creator.id } });
  if (!creatorAccount) {
    creatorAccount = await prisma.creatorEmailAccount.create({
      data: { creatorId: creator.id, emailAddress: `rahultest${uniq}@vidlix.in`, localPart: `rahultest${uniq}`, domain: "vidlix.in" },
    });
  }
  const thread = await prisma.emailThread.create({
    data: {
      creatorEmailAccountId: creatorAccount.id,
      subject: `Creator reply test ${uniq}`,
      lastMessageAt: new Date(),
      messages: {
        create: {
          fromEmail: "brand.contact@example.com",
          toEmail: creatorAccount.emailAddress,
          subject: `Creator reply test ${uniq}`,
          textBody: "Hi, checking in.",
          direction: "INBOUND",
          status: "RECEIVED",
          receivedAt: new Date(),
        },
      },
    },
  });

  await page.goto(`${BASE}/admin/inbox/${thread.id}`);
  await page.fill('textarea[name="body"]', "Thanks for reaching out!");
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(1200);

  const log2 = await prisma.emailLog.findFirst({
    where: { subject: `Re: Creator reply test ${uniq}` },
    orderBy: { createdAt: "desc" },
  });
  log("creator-mailbox reply EmailLog.fromEmail:", log2?.fromEmail);
  const creatorFromOk = !!log2?.fromEmail?.includes(`"${creator.name}"`) && log2.fromEmail.includes(creatorAccount.emailAddress);

  await browser.close();
  await prisma.$disconnect();

  const ok = standaloneFromOk && creatorFromOk;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-email-sender-name] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

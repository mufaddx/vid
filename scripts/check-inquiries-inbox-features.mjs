import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-inquiries-inbox]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await adminLogin(page, { base: BASE });
  log("login OK");

  const uniq = Date.now().toString().slice(-6);

  // --- 1. New inquiry -> sidebar badge, NEW pill, View dialog, status email ---
  const inquiry = await prisma.inquiry.create({
    data: {
      type: "CREATOR",
      status: "NEW",
      fullName: `Test Applicant ${uniq}`,
      email: `applicant.${uniq}@example.com`,
      phone: "9998887777",
      payload: { fullName: `Test Applicant ${uniq}`, email: `applicant.${uniq}@example.com`, phone: "9998887777", instagram: "testapplicant", bio: "A short bio for the test." },
    },
  });

  await page.goto(`${BASE}/admin/inquiries`);
  const sidebarBadgeBefore = await page.locator('a[href="/admin/inquiries"] span').last().innerText().catch(() => "0");
  log("sidebar inquiries badge (should include the new one):", sidebarBadgeBefore);

  const newPillCount = await page.locator("text=NEW").count();
  log("NEW pill visible on the unviewed inquiry:", newPillCount > 0);

  await page.locator('button:has-text("View")').first().click();
  await page.waitForSelector(`text=${inquiry.email}`, { timeout: 5000 });
  const bioVisible = await page.locator("text=A short bio for the test.").count();
  log("full payload field (bio) shown in detail dialog:", bioVisible > 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  const afterView = await prisma.inquiry.findUniqueOrThrow({ where: { id: inquiry.id } });
  log("viewedAt set after opening dialog:", !!afterView.viewedAt);

  await page.reload();
  const sidebarBadgeAfter = await page.locator('a[href="/admin/inquiries"] span').last().innerText().catch(() => "0");
  log("sidebar badge after viewing (should be one less than before, or absent):", sidebarBadgeAfter);

  // Change status -> should email the applicant
  await page.locator('[role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("Approved")').click();
  await page.waitForTimeout(800);

  const statusEmail = await prisma.emailLog.findFirst({
    where: { toEmail: inquiry.email, template: "inquiry_status_update" },
    orderBy: { createdAt: "desc" },
  });
  log("status-update email sent to applicant:", !!statusEmail);

  // --- 2. Inbox: unread badge + mark-read + contact name ---
  const account = await prisma.creatorEmailAccount.findFirst({ where: { emailAddress: "hello@vidlix.in" } });
  const thread = await prisma.emailThread.create({
    data: {
      creatorEmailAccountId: account.id,
      subject: `Regression inbox test ${uniq}`,
      lastMessageAt: new Date(),
      unread: true,
      messages: {
        create: {
          fromEmail: `external.${uniq}@example.com`,
          toEmail: account.emailAddress,
          subject: `Regression inbox test ${uniq}`,
          textBody: "Hello from an external sender.",
          direction: "INBOUND",
          status: "RECEIVED",
          receivedAt: new Date(),
        },
      },
    },
  });

  await page.goto(`${BASE}/admin/inbox`);
  const inboxBadge = await page.locator('a[href="/admin/inbox"] span').last().innerText().catch(() => "0");
  log("sidebar inbox badge (should be >= 1):", inboxBadge);
  const unreadDotVisible = await page.locator(`text=Regression inbox test ${uniq}`).count();
  log("unread thread visible in list:", unreadDotVisible > 0);

  await page.locator(`a:has-text("Regression inbox test ${uniq}")`).click();
  await page.waitForURL(new RegExp(thread.id));
  await page.waitForSelector("text=Add name", { timeout: 5000 });

  const threadAfterOpen = await prisma.emailThread.findUniqueOrThrow({ where: { id: thread.id } });
  log("thread marked read after opening:", threadAfterOpen.unread === false);

  await page.click("text=Add name");
  await page.fill('input[placeholder="Add a name for this contact"]', "Test External Contact");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);

  const threadWithName = await prisma.emailThread.findUniqueOrThrow({ where: { id: thread.id } });
  log("contactName saved:", threadWithName.contactName);

  await page.reload();
  const contactNameVisible = await page.locator("text=Test External Contact").count();
  log("contact name shown on reload:", contactNameVisible > 0);

  await browser.close();
  await prisma.$disconnect();

  const ok =
    newPillCount > 0 &&
    bioVisible > 0 &&
    afterView.viewedAt &&
    statusEmail &&
    unreadDotVisible > 0 &&
    threadAfterOpen.unread === false &&
    threadWithName.contactName === "Test External Contact" &&
    contactNameVisible > 0;

  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-inquiries-inbox] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

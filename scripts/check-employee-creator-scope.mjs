import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-scope]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await adminLogin(page, { base: BASE });
  log("super admin login OK");

  // Ensure at least 3 creators exist to pick from.
  const allCreators = await prisma.creator.findMany({ orderBy: { createdAt: "asc" }, take: 3 });
  if (allCreators.length < 2) throw new Error("Need at least 2 seeded creators for this test");
  const [assignedCreator, unassignedCreator] = allCreators;

  // --- 1. Super Admin creates a Talent Manager with 1 assigned creator ---
  const uniq = Date.now().toString().slice(-6);
  const email = `talent.mgr.${uniq}@example.com`;
  const password = "TestPass1234";

  await page.goto(`${BASE}/admin/employees`);
  await page.click('button:has-text("Add Employee")');
  await page.fill("#name", "Test Talent Manager");
  await page.fill("#email", email);
  await page.locator('form [role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("Talent Manager")').click();

  // Managed Creators picker should now be visible — assign one creator.
  await page.click('button:has-text("No creators assigned")');
  await page.fill('input[placeholder="Search creators…"]', assignedCreator.name);
  await page.waitForTimeout(200);
  await page.locator(`label:has-text("${assignedCreator.name}")`).click();
  await page.keyboard.press("Escape");

  await page.fill("#password", password);
  await page.click('button[type="submit"]:has-text("Create Employee")');
  await page.waitForTimeout(1000);

  const employee = await prisma.adminUser.findUniqueOrThrow({ where: { email } });
  const assignedRows = await prisma.employeeManagedCreator.findMany({ where: { adminUserId: employee.id } });
  log("employee created with", assignedRows.length, "managed creator(s), expected 1");

  // --- 2. Log in as the Talent Manager ---
  await page.context().clearCookies();
  await adminLogin(page, { base: BASE, email, password });
  log("talent manager login OK");

  // --- 3. Creators list shows ONLY the assigned creator ---
  await page.goto(`${BASE}/admin/creators`);
  const showsAssigned = (await page.locator(`text=${assignedCreator.name}`).count()) > 0;
  const hidesUnassigned = (await page.locator(`text=${unassignedCreator.name}`).count()) === 0;
  log("creators list shows assigned creator:", showsAssigned, "| hides unassigned creator:", hidesUnassigned);

  // --- 4. Direct URL to an unassigned creator's detail page 404s ---
  const resp = await page.goto(`${BASE}/admin/creators/${unassignedCreator.id}`);
  log("direct nav to unassigned creator detail status:", resp.status());

  // --- 5. Assigned creator's detail page IS reachable ---
  const resp2 = await page.goto(`${BASE}/admin/creators/${assignedCreator.id}`);
  log("direct nav to assigned creator detail status:", resp2.status());

  // --- 6. A manager with ZERO assigned creators is unrestricted (default) ---
  await page.context().clearCookies();
  await adminLogin(page, { base: BASE }); // back to super admin
  const unrestrictedEmail = `unrestricted.mgr.${uniq}@example.com`;
  await page.goto(`${BASE}/admin/employees`);
  await page.click('button:has-text("Add Employee")');
  await page.fill("#name", "Unrestricted Manager");
  await page.fill("#email", unrestrictedEmail);
  await page.locator('form [role="combobox"]').first().click();
  await page.locator('[role="option"]:has-text("Talent Manager")').click();
  // Deliberately leave the Managed Creators picker empty.
  await page.fill("#password", password);
  await page.click('button[type="submit"]:has-text("Create Employee")');
  await page.waitForTimeout(1000);

  await page.context().clearCookies();
  await adminLogin(page, { base: BASE, email: unrestrictedEmail, password });
  await page.goto(`${BASE}/admin/creators`);
  const unrestrictedSeesBoth =
    (await page.locator(`text=${assignedCreator.name}`).count()) > 0 &&
    (await page.locator(`text=${unassignedCreator.name}`).count()) > 0;
  log("manager with zero assignments sees ALL creators (unrestricted default):", unrestrictedSeesBoth);

  await browser.close();
  await prisma.$disconnect();

  const ok =
    assignedRows.length === 1 && showsAssigned && hidesUnassigned &&
    resp.status() === 404 && resp2.status() === 200 &&
    unrestrictedSeesBoth;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-scope] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

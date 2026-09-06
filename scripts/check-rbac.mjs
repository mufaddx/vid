import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-rbac]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // --- 1. Super Admin creates a Campaign Manager employee ---
  await adminLogin(page, { base: BASE });
  log("super admin login OK");

  const uniq = Date.now().toString().slice(-6);
  const employeeEmail = `campaign.mgr.${uniq}@example.com`;
  const employeePassword = "TestPass1234";

  await page.goto(`${BASE}/admin/employees`);
  await page.click('button:has-text("Add Employee")');
  await page.fill("#name", "Test Campaign Manager");
  await page.fill("#email", employeeEmail);
  await page.fill("#password", employeePassword);
  await page.locator('form [role="combobox"]').click();
  await page.locator('[role="option"]:has-text("Campaign Manager")').click();
  await page.click('button[type="submit"]:has-text("Create Employee")');
  await page.waitForTimeout(1000);
  const rowVisible = (await page.locator(`text=${employeeEmail}`).count()) > 0;
  log("employee created, row visible:", rowVisible);

  // --- 2. Log out, log in as the new Campaign Manager ---
  // (clearing the session cookie directly rather than clicking "Sign out"
  // — the Next.js dev-mode tools indicator badge sits at the same
  // bottom-left corner as the sidebar's sign-out link and swallows real
  // clicks there; a dev-overlay-only quirk unrelated to what's tested here.)
  await page.context().clearCookies();
  await page.goto(`${BASE}/admin/login`);

  await adminLogin(page, { base: BASE, email: employeeEmail, password: employeePassword });
  log("campaign manager login OK");

  // --- 3. Sidebar only shows permitted modules ---
  const sidebarText = await page.locator("aside nav").innerText();
  const showsBrands = sidebarText.includes("Brands");
  const showsCampaigns = sidebarText.includes("Campaigns");
  const showsCreators = sidebarText.includes("Creators");
  const showsBilling = sidebarText.includes("Billing");
  const showsEmployees = sidebarText.includes("Employees");
  const showsSettings = sidebarText.includes("Settings");
  log("sidebar shows Brands:", showsBrands, "| Campaigns:", showsCampaigns, "(expected true)");
  log("sidebar shows Creators:", showsCreators, "| Billing:", showsBilling, "| Employees:", showsEmployees, "| Settings:", showsSettings, "(expected all false)");

  // --- 4. Direct navigation to a disallowed route redirects to dashboard ---
  await page.goto(`${BASE}/admin/billing`);
  await page.waitForTimeout(500);
  const redirectedToDashboard = page.url() === `${BASE}/admin/dashboard`;
  log("direct nav to /admin/billing redirected to dashboard:", redirectedToDashboard, "| actual url:", page.url());

  await page.goto(`${BASE}/admin/employees`);
  await page.waitForTimeout(500);
  const employeesRedirected = page.url() === `${BASE}/admin/dashboard`;
  log("direct nav to /admin/employees redirected to dashboard:", employeesRedirected);

  // --- 5. Allowed module (Brands) works normally, including its modal ---
  await page.goto(`${BASE}/admin/brands`);
  const brandsPageOk = page.url() === `${BASE}/admin/brands`;
  await page.click('button:has-text("Add Brand")');
  const brandModalName = `RBAC Test Brand ${uniq}`;
  await page.fill("#name", brandModalName);
  await page.locator('form button[type="submit"]:has-text("Add Brand")').click();
  await page.waitForTimeout(1000);
  const brandCreated = (await page.locator(`text=${brandModalName}`).count()) > 0;
  log("brands page accessible:", brandsPageOk, "| allowed action (create brand) succeeded:", brandCreated);

  await browser.close();

  const employee = await prisma.adminUser.findUniqueOrThrow({ where: { email: employeeEmail } });
  log("employee role in DB:", employee.role, "| active:", employee.active);

  await prisma.$disconnect();

  const ok =
    rowVisible &&
    showsBrands && showsCampaigns &&
    !showsCreators && !showsBilling && !showsEmployees && !showsSettings &&
    redirectedToDashboard && employeesRedirected &&
    brandsPageOk && brandCreated;

  log(ok ? "ALL RBAC CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-rbac] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

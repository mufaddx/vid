// Regression check for the ERR_PACKAGE_PATH_NOT_EXPORTED crash: a long
// paragraph used to trigger @react-pdf/renderer's lazy hyphenation loader,
// which threw because @react-pdf/hyphenate doesn't export "./en-us" in its
// package.json. Font.registerHyphenationCallback in Letterhead.tsx should
// prevent that path from ever running.
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { adminLogin } from "./lib/admin-login.mjs";

const BASE = "http://127.0.0.1:3000";
const prisma = new PrismaClient();
const log = (...a) => console.log("[check-pdf-hyphenation]", ...a);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await adminLogin(page, { base: BASE });
  log("login OK");

  const creator = await prisma.creator.findFirstOrThrow({ where: { slug: "rahul-sharma" } });

  const agreement = await prisma.agreement.create({
    data: {
      agreementNumber: `AGR-TEST-${Date.now().toString().slice(-6)}`,
      type: "CREATOR_MANAGEMENT",
      creatorId: creator.id,
      status: "DRAFT",
      commissionPercentage: "30",
      startDate: new Date(),
      details: {
        kind: "CREATOR_MANAGEMENT",
        agreementDate: new Date().toISOString().slice(0, 10),
        monthlyFee: { isFree: true, amount: 0 },
        additionalServices: [],
        socialHandles: { instagram: "rahultest" },
        platformCommissions: { instagram: 10 },
        // A genuinely long paragraph — long enough to force react-pdf to
        // wrap across lines and hit the hyphenation codepath that used to
        // crash with a short/blank terms field never would.
        terms:
          "The Creator appoints VIDLIX as their exclusive management representative to secure, negotiate and administer brand collaborations across the Creator's social media presence, effective the Agreement Date above. VIDLIX agrees to act in good faith and provide transparent, itemised, and fully auditable accounting of revenue and commission for each connected platform under management, on a monthly basis, reconciled against actual creator payouts received from brands and platforms. Content created by the Creator remains the Creator's exclusive intellectual property at all times, and VIDLIX shall have no ownership claim whatsoever over any content, likeness, trademark, or derivative work produced by the Creator during or after the term of this engagement. This Agreement remains in effect until terminated in writing by either party through a separate Cancellation Agreement, and is governed exclusively by the laws of India, with courts of competent jurisdiction in Mumbai, Maharashtra having sole authority to adjudicate any dispute arising hereunder.",
        customSections: [],
      },
    },
  });

  const resp = await page.request.get(`${BASE}/api/agreements/${agreement.id}/pdf`, {
    headers: { cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") },
  });
  log("PDF route status:", resp.status(), "content-type:", resp.headers()["content-type"]);
  const buf = await resp.body();
  log("PDF bytes:", buf.length);

  await prisma.agreement.delete({ where: { id: agreement.id } });
  await browser.close();
  await prisma.$disconnect();

  const ok = resp.status() === 200 && buf.length > 1000;
  log(ok ? "ALL CHECKS PASSED ✔" : "SOME CHECKS FAILED ✘");
  if (!ok) process.exit(1);
}

main().catch(async (e) => {
  console.error("[check-pdf-hyphenation] FAILED", e);
  await prisma.$disconnect();
  process.exit(1);
});

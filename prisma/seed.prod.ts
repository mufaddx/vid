import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_TEMPLATES } from "../src/lib/default-templates";
import { seedSiteContent } from "./content-seed";

// Production bootstrap seed — creates ONLY the essentials every fresh
// deployment needs (company settings, the super admin login, and the
// default agreement templates). Deliberately excludes everything
// prisma/seed.ts adds after that (Rahul Sharma, Nike India, demo
// campaign/collaboration/inbox thread) — that's local-prototype demo
// data and must never land in the real production database.
//
// Run once, right after the first `prisma migrate deploy`:
//   npx tsx prisma/seed.prod.ts
//
// Placeholder company details below (GSTIN, address) are NOT real —
// log in after seeding and correct them at /admin/settings before
// sending anything to a real creator or brand.

const prisma = new PrismaClient();

async function main() {
  const companyData = {
    companyName: "VIDLIX",
    legalName: "Vidlix Media Private Limited",
    tagline: "CREATORS • BRANDS • BEYOND",
    email: "hello@vidlix.in",
    phone: "+91 74887 16130",
    website: "https://vidlix.in",
    address: "PLACEHOLDER — set your real registered address in Admin > Settings",
    gstin: "PLACEHOLDER — set your real GSTIN in Admin > Settings",
    defaultCommissionPct: 30,
  };
  await prisma.companySettings.upsert({
    where: { id: "company" },
    update: {},
    create: { id: "company", ...companyData },
  });

  // The company's own working mailbox — standalone, not tied to any
  // creator. Previously only existed as CompanySettings.email/the
  // EMAIL_FROM fallback, never as a real, manageable mailbox row.
  await prisma.creatorEmailAccount.upsert({
    where: { emailAddress: "hello@vidlix.in" },
    update: {},
    create: { emailAddress: "hello@vidlix.in", localPart: "hello", domain: "vidlix.in" },
  });

  const passwordHash = await bcrypt.hash("vidlix@admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@vidlix.in" },
    update: {},
    create: {
      name: "VIDLIX Admin",
      email: "admin@vidlix.in",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  for (const t of DEFAULT_TEMPLATES) {
    const existing = await prisma.agreementTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.agreementTemplate.create({ data: { ...t, status: "ACTIVE" } });
    }
  }

  await seedSiteContent(prisma);

  console.log("Production seed complete.");
  console.log("Admin login: admin@vidlix.in / vidlix@admin123");
  console.log("⚠ Change this password and fill in real company details at /admin/settings immediately.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

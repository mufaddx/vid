import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_TEMPLATES } from "../src/lib/default-templates";
import { seedSiteContent } from "./content-seed";

const prisma = new PrismaClient();

async function main() {
  // Company settings (singleton)
  const companyData = {
    companyName: "VIDLIX",
    legalName: "Vidlix Media Private Limited",
    tagline: "CREATORS • BRANDS • BEYOND",
    email: "hello@vidlix.in",
    phone: "+91 74887 16130",
    website: "https://vidlix.in",
    address: "Cyber Hub, DLF Phase 2, Gurugram, Haryana, India",
    gstin: "07ABCDE1234F1Z5",
    defaultCommissionPct: 30,
  };
  await prisma.companySettings.upsert({
    where: { id: "company" },
    update: companyData,
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

  // Super admin
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

  // Agreement templates
  for (const t of DEFAULT_TEMPLATES) {
    const existing = await prisma.agreementTemplate.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.agreementTemplate.create({
        data: { ...t, status: "ACTIVE" },
      });
    }
  }

  // Demo creator: Rahul Sharma
  const rahul = await prisma.creator.upsert({
    where: { slug: "rahul-sharma" },
    update: {},
    create: {
      name: "Rahul Sharma",
      slug: "rahul-sharma",
      displayName: "Rahul Sharma",
      email: "rahul.sharma.creator@example.com",
      phone: "+91 98100 00000",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      bio: "Delhi-based lifestyle and fashion creator known for effortless street style and travel diaries.",
      longBio:
        "Rahul Sharma is a Delhi-based lifestyle and fashion creator who started his content journey in 2021. Since joining VIDLIX, he has collaborated with leading fashion and lifestyle brands across India, building a loyal, highly-engaged audience across Instagram, YouTube and Facebook.",
      journeyStartYear: 2021,
      category: "Fashion & Lifestyle",
      languages: ["Hindi", "English"],
      status: "ACTIVE",
      featured: true,
      orbitPriority: 1,
      managementStartDate: new Date("2024-01-15"),
      managementFee: 50000,
      commissionPercentage: 30,
    },
  });

  await prisma.creatorJourneyEntry.deleteMany({ where: { creatorId: rahul.id } });
  await prisma.creatorJourneyEntry.createMany({
    data: [
      { creatorId: rahul.id, year: 2021, title: "Started Content Creation", order: 1 },
      { creatorId: rahul.id, year: 2022, title: "Reached 100K Audience", order: 2 },
      { creatorId: rahul.id, year: 2024, title: "Joined VIDLIX", order: 3 },
      { creatorId: rahul.id, year: 2025, title: "Major Brand Collaborations", order: 4 },
      { creatorId: rahul.id, year: 2026, title: "369K+ Total Audience", order: 5 },
    ],
  });

  const socials: { platform: "INSTAGRAM" | "YOUTUBE" | "FACEBOOK"; username: string; followers: number; subscribers: number }[] = [
    { platform: "INSTAGRAM", username: "rahulcreator", followers: 245812, subscribers: 0 },
    { platform: "YOUTUBE", username: "RahulCreator", followers: 0, subscribers: 82421 },
    { platform: "FACEBOOK", username: "rahulcreator.official", followers: 41290, subscribers: 0 },
  ];

  for (const s of socials) {
    const account = await prisma.socialAccount.upsert({
      where: { creatorId_platform: { creatorId: rahul.id, platform: s.platform } },
      update: { username: s.username, connectionStatus: "CONNECTED", lastSyncedAt: new Date() },
      create: {
        creatorId: rahul.id,
        platform: s.platform,
        username: s.username,
        connectionStatus: "CONNECTED",
        lastSyncedAt: new Date(),
      },
    });
    await prisma.socialMetric.upsert({
      where: { socialAccountId: account.id },
      update: { followers: s.followers, subscribers: s.subscribers, lastUpdated: new Date() },
      create: {
        socialAccountId: account.id,
        followers: s.followers,
        subscribers: s.subscribers,
      },
    });
  }

  // Demo brand + campaign
  const nike = await prisma.brand.upsert({
    where: { slug: "nike-india" },
    update: {},
    create: {
      name: "Nike India",
      slug: "nike-india",
      contactPerson: "Ananya Rao",
      email: "ananya.rao@brandmail.example",
      phone: "+91 99000 00000",
      website: "https://nike.com",
      industry: "Sportswear",
      status: "ACTIVE",
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: { id: "seed-campaign-nike-summer" },
    update: {},
    create: {
      id: "seed-campaign-nike-summer",
      name: "Nike Summer Campaign",
      brandId: nike.id,
      description: "Summer collection lookbook featuring VIDLIX-managed creators.",
      budget: 200000,
      status: "ACTIVE",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-08-31"),
    },
  });

  await prisma.collaboration.upsert({
    where: { id: "seed-collab-nike-rahul" },
    update: {},
    create: {
      id: "seed-collab-nike-rahul",
      campaignId: campaign.id,
      brandId: nike.id,
      status: "ACTIVE",
      creators: { create: { creatorId: rahul.id } },
    },
  });

  // Demo creator email account + inbox thread (spec §90-102)
  const rahulEmail = await prisma.creatorEmailAccount.upsert({
    where: { emailAddress: "rahul@vidlix.in" },
    update: {},
    create: {
      creatorId: rahul.id,
      emailAddress: "rahul@vidlix.in",
      localPart: "rahul",
      domain: "vidlix.in",
    },
  });

  const existingThread = await prisma.emailThread.findFirst({
    where: { creatorEmailAccountId: rahulEmail.id, subject: "Nike Summer Campaign — Content Timeline" },
  });
  if (!existingThread) {
    const thread = await prisma.emailThread.create({
      data: {
        creatorEmailAccountId: rahulEmail.id,
        subject: "Nike Summer Campaign — Content Timeline",
        lastMessageAt: new Date(),
      },
    });
    await prisma.emailMessage.createMany({
      data: [
        {
          threadId: thread.id,
          fromEmail: "ananya.rao@brandmail.example",
          toEmail: "rahul@vidlix.in",
          subject: "Nike Summer Campaign — Content Timeline",
          textBody:
            "Hi Rahul team, excited to kick off the summer campaign. Could you share the proposed content delivery timeline?",
          direction: "INBOUND",
          status: "RECEIVED",
          receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
        {
          threadId: thread.id,
          fromEmail: "rahul@vidlix.in",
          toEmail: "ananya.rao@brandmail.example",
          subject: "Re: Nike Summer Campaign — Content Timeline",
          textBody:
            "Hi Ananya, thanks for reaching out — VIDLIX here on behalf of Rahul. We'll have the first draft ready within 5 business days.",
          direction: "OUTBOUND",
          status: "SENT",
          sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        },
      ],
    });
  }

  await seedSiteContent(prisma);

  console.log("Seed complete.");
  console.log("Admin login: admin@vidlix.in / vidlix@admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

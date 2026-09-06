"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { computeTotalAudience } from "@/lib/audience";
import { hasPermission } from "@/lib/permissions";

const creatorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  category: z.string().optional(),
  bio: z.string().optional(),
  longBio: z.string().optional(),
  journeyStartYear: z.coerce.number().int().optional(),
  managementFee: z.coerce.number().nonnegative().optional(),
  commissionPercentage: z.coerce.number().min(0).max(100).default(30),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("PENDING"),
  featured: z.coerce.boolean().default(false),
});

export type CreatorFormState = { error?: string; ok?: true; id?: string } | undefined;

export async function createCreatorAction(
  _prev: CreatorFormState,
  formData: FormData,
): Promise<CreatorFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!hasPermission(session.role, "creators")) {
    return { error: "Your role does not have access to Creators." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = creatorSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  let slug = slugify(data.name);
  const existing = await prisma.creator.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const creator = await prisma.creator.create({
    data: {
      name: data.name,
      slug,
      displayName: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country,
      category: data.category || undefined,
      bio: data.bio || undefined,
      longBio: data.longBio || undefined,
      journeyStartYear: data.journeyStartYear,
      managementFee: data.managementFee,
      commissionPercentage: data.commissionPercentage,
      status: data.status,
      featured: data.featured,
      managementStartDate: data.status === "ACTIVE" ? new Date() : undefined,
    },
  });

  await logActivity({
    actorId: session.id,
    action: "Creator onboarded",
    entityType: "Creator",
    entityId: creator.id,
    creatorId: creator.id,
  });

  revalidatePath("/admin/creators");
  return { ok: true, id: creator.id };
}

export async function updateCreatorAction(
  id: string,
  _prev: CreatorFormState,
  formData: FormData,
): Promise<CreatorFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = creatorSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  await prisma.creator.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country,
      category: data.category || undefined,
      bio: data.bio || undefined,
      longBio: data.longBio || undefined,
      journeyStartYear: data.journeyStartYear,
      managementFee: data.managementFee,
      commissionPercentage: data.commissionPercentage,
      status: data.status,
      featured: data.featured,
    },
  });

  await logActivity({
    actorId: session.id,
    action: "Creator profile updated",
    entityType: "Creator",
    entityId: id,
    creatorId: id,
  });

  revalidatePath(`/admin/creators/${id}`);
  redirect(`/admin/creators/${id}`);
}

const socialSchema = z.object({
  platform: z.enum(["INSTAGRAM", "YOUTUBE", "FACEBOOK"]),
  username: z.string().min(1),
  followers: z.coerce.number().int().nonnegative().default(0),
  subscribers: z.coerce.number().int().nonnegative().default(0),
});

export async function connectSocialAccountAction(
  creatorId: string,
  formData: FormData,
): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const parsed = socialSchema.parse(Object.fromEntries(formData.entries()));

  const account = await prisma.socialAccount.upsert({
    where: { creatorId_platform: { creatorId, platform: parsed.platform } },
    update: {
      username: parsed.username,
      connectionStatus: "CONNECTED",
      lastSyncedAt: new Date(),
    },
    create: {
      creatorId,
      platform: parsed.platform,
      username: parsed.username,
      connectionStatus: "CONNECTED",
      lastSyncedAt: new Date(),
    },
  });

  await prisma.socialMetric.upsert({
    where: { socialAccountId: account.id },
    update: {
      followers: parsed.followers,
      subscribers: parsed.subscribers,
      lastUpdated: new Date(),
    },
    create: {
      socialAccountId: account.id,
      followers: parsed.followers,
      subscribers: parsed.subscribers,
    },
  });

  await prisma.socialMetricSnapshot.create({
    data: { socialAccountId: account.id, followers: parsed.followers, subscribers: parsed.subscribers },
  });

  const accounts = await prisma.socialAccount.findMany({
    where: { creatorId },
    include: { metric: true },
  });
  await prisma.creatorAudienceSnapshot.create({
    data: { creatorId, totalAudience: computeTotalAudience(accounts) },
  });

  await logActivity({
    actorId: session.id,
    action: `${parsed.platform} account connected`,
    entityType: "SocialAccount",
    entityId: account.id,
    creatorId,
  });

  revalidatePath(`/admin/creators/${creatorId}`);
}

"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/activity";

const brandSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export async function createBrandAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = brandSchema.parse(Object.fromEntries(formData.entries()));
  let slug = slugify(data.name);
  if (await prisma.brand.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const brand = await prisma.brand.create({
    data: {
      name: data.name,
      slug,
      contactPerson: data.contactPerson || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      website: data.website || undefined,
      industry: data.industry || undefined,
      notes: data.notes || undefined,
    },
  });

  await logActivity({ actorId: session.id, action: `Brand ${brand.name} added`, entityType: "Brand", entityId: brand.id });

  redirect(`/admin/brands/${brand.id}`);
}

const campaignSchema = z.object({
  name: z.string().min(2),
  brandId: z.string().min(1),
  description: z.string().optional(),
  budget: z.coerce.number().nonnegative().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .enum([
      "DRAFT",
      "PLANNING",
      "CREATOR_SELECTION",
      "NEGOTIATION",
      "AGREEMENT_PENDING",
      "ACTIVE",
      "CONTENT_REVIEW",
      "PUBLISHED",
      "COMPLETED",
      "CANCELLED",
    ])
    .default("DRAFT"),
});

export async function createCampaignAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = campaignSchema.parse(Object.fromEntries(formData.entries()));

  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      brandId: data.brandId,
      description: data.description || undefined,
      budget: data.budget,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status,
    },
  });

  await logActivity({ actorId: session.id, action: `Campaign ${campaign.name} created`, entityType: "Campaign", entityId: campaign.id });

  redirect(`/admin/campaigns`);
}

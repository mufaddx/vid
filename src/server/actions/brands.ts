"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/activity";
import { hasPermission } from "@/lib/permissions";

const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required."),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

export type BrandFormState = { error?: string; ok?: true; id?: string } | undefined;

export async function createBrandAction(
  _prev: BrandFormState,
  formData: FormData,
): Promise<BrandFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!hasPermission(session.role, "brands")) {
    return { error: "Your role does not have access to Brands." };
  }

  const parsed = brandSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

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

  revalidatePath("/admin/brands");
  return { ok: true, id: brand.id };
}

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required."),
  brandId: z.string().min(1, "Please select a brand."),
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

export type CampaignFormState = { error?: string; ok?: true; id?: string } | undefined;

export async function createCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!hasPermission(session.role, "campaigns")) {
    return { error: "Your role does not have access to Campaigns." };
  }

  const parsed = campaignSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

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

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/brands/${data.brandId}`);
  return { ok: true, id: campaign.id };
}

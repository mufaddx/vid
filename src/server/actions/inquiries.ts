"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { creatorInquiryConfirmationEmail, brandInquiryConfirmationEmail } from "@/lib/email/templates";
import { logActivity } from "@/lib/activity";

const creatorInquirySchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  facebook: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  currentAudience: z.string().optional(),
  portfolio: z.string().optional(),
  bio: z.string().optional(),
  reason: z.string().optional(),
});

export async function submitCreatorInquiryAction(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData.entries());
  const data = creatorInquirySchema.parse(raw);

  await prisma.inquiry.create({
    data: {
      type: "CREATOR",
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      payload: raw as Record<string, string>,
    },
  });

  await sendEmail({
    to: data.email,
    subject: "VIDLIX — We've received your application",
    html: creatorInquiryConfirmationEmail(data.fullName),
    template: "creator_inquiry_confirmation",
  });

  redirect("/creator-inquiry/received");
}

const brandInquirySchema = z.object({
  brandName: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  website: z.string().optional(),
  campaignName: z.string().min(2),
  campaignDescription: z.string().min(2),
  campaignType: z.string().optional(),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  creatorId: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

export async function submitBrandInquiryAction(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData.entries());
  const data = brandInquirySchema.parse(raw);

  const inquiry = await prisma.inquiry.create({
    data: {
      type: "BRAND",
      fullName: data.contactPerson,
      email: data.email,
      phone: data.phone,
      brandName: data.brandName,
      website: data.website,
      message: data.campaignDescription,
      creatorId: data.creatorId || undefined,
      payload: raw as Record<string, string>,
    },
  });

  await sendEmail({
    to: data.email,
    subject: "VIDLIX — Your inquiry has been received",
    html: brandInquiryConfirmationEmail(data.contactPerson, data.brandName),
    template: "brand_inquiry_confirmation",
  });

  await logActivity({
    action: `New brand inquiry from ${data.brandName}`,
    entityType: "Inquiry",
    entityId: inquiry.id,
  });

  redirect("/brand-inquiry/received");
}

export async function updateInquiryStatusAction(id: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const status = String(formData.get("status"));
  await prisma.inquiry.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/admin/inquiries");
}

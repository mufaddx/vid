"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const settingsSchema = z.object({
  companyName: z.string().min(1),
  legalName: z.string().min(1),
  tagline: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  website: z.string().min(1),
  address: z.string().min(1),
  gstin: z.string().optional(),
  cin: z.string().optional(),
  defaultCommissionPct: z.coerce.number().min(0).max(100),
  defaultDueDays: z.coerce.number().int().positive(),
  invoicePrefix: z.string().min(1),
  receiptPrefix: z.string().min(1),
  paymentPrefix: z.string().min(1),
  payoutPrefix: z.string().min(1),
  agreementPrefix: z.string().min(1),
  bankDetails: z.string().optional(),
  upiDetails: z.string().optional(),
  instagramUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  xUrl: z.string().optional(),
});

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateCompanySettingsAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.companySettings.update({
    where: { id: "company" },
    data: parsed.data,
  });

  await logActivity({ actorId: session.id, action: "Company settings updated", entityType: "CompanySettings", entityId: "company" });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { success: true };
}

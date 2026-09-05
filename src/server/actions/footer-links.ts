"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const linkSchema = z.object({
  group: z.enum(["COMPANY", "PLATFORM", "GET_STARTED"]),
  label: z.string().min(1),
  href: z.string().min(1),
});

export async function createFooterLinkAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const data = linkSchema.parse(Object.fromEntries(formData.entries()));
  const count = await prisma.footerLink.count({ where: { group: data.group } });
  await prisma.footerLink.create({ data: { ...data, order: count + 1 } });

  await logActivity({ actorId: session.id, action: `Footer link "${data.label}" added`, entityType: "FooterLink", entityId: data.group });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function deleteFooterLinkAction(linkId: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const link = await prisma.footerLink.delete({ where: { id: linkId } });
  await logActivity({ actorId: session.id, action: `Footer link "${link.label}" removed`, entityType: "FooterLink", entityId: linkId });
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const legalSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(1),
});

export async function updateLegalPageAction(slug: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = legalSchema.parse(Object.fromEntries(formData.entries()));
  await prisma.legalPage.update({ where: { slug }, data });

  await logActivity({ actorId: session.id, action: `Legal page "${data.title}" updated`, entityType: "LegalPage", entityId: slug });
  revalidatePath(`/admin/legal/${slug}`);
  revalidatePath(`/legal/${slug}`);
  revalidatePath("/legal");
}

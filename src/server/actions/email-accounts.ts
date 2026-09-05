"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/send";
import { creatorEmailCreatedEmail } from "@/lib/email/templates";

const DOMAIN = "vidlix.in";
const RESERVED = new Set([
  "admin",
  "hello",
  "support",
  "billing",
  "info",
  "noreply",
  "no-reply",
  "postmaster",
  "abuse",
  "webmaster",
  "sales",
  "contact",
  "security",
]);

const localPartSchema = z
  .string()
  .min(2)
  .max(32)
  .regex(/^[a-z0-9](?:[a-z0-9.]*[a-z0-9])?$/, "Use lowercase letters, numbers and dots only.");

export type EmailAccountFormState = { error?: string } | undefined;

export async function createCreatorEmailAccountAction(
  creatorId: string,
  _prev: EmailAccountFormState,
  formData: FormData,
): Promise<EmailAccountFormState> {
  const session = await getSession();
  if (!session) return { error: "Not authorized." };

  const localPartRaw = String(formData.get("localPart") || "").trim().toLowerCase();
  const parsed = localPartSchema.safeParse(localPartRaw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid local part." };
  }
  const localPart = parsed.data;

  if (RESERVED.has(localPart)) {
    return { error: `${localPart}@${DOMAIN} is a reserved address.` };
  }

  const emailAddress = `${localPart}@${DOMAIN}`;
  const existing = await prisma.creatorEmailAccount.findUnique({ where: { emailAddress } });
  if (existing) {
    return { error: `${emailAddress} is already taken.` };
  }

  const creator = await prisma.creator.findUniqueOrThrow({ where: { id: creatorId } });

  const account = await prisma.creatorEmailAccount.create({
    data: { creatorId, emailAddress, localPart, domain: DOMAIN },
  });

  await logActivity({
    actorId: session.id,
    action: `Creator email created (${emailAddress})`,
    entityType: "CreatorEmailAccount",
    entityId: account.id,
    creatorId,
  });

  if (creator.email) {
    await sendEmail({
      to: creator.email,
      subject: "Your Official VIDLIX Creator Email",
      html: creatorEmailCreatedEmail({ creatorName: creator.name, emailAddress }),
      template: "creator_email_created",
    });
  }

  revalidatePath(`/admin/creators/${creatorId}`);
}

"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email/send";

export async function sendInboxReplyAction(threadId: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const thread = await prisma.emailThread.findUniqueOrThrow({
    where: { id: threadId },
    include: { creatorEmailAccount: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const lastInbound = thread.messages.find((m) => m.direction === "INBOUND") ?? thread.messages[0];
  const toEmail = lastInbound?.fromEmail ?? "unknown@brand.example";
  const subject = `Re: ${thread.subject}`;
  const htmlBody = body.replace(/\n/g, "<br/>");

  await sendEmail({
    from: thread.creatorEmailAccount.emailAddress,
    to: toEmail,
    subject,
    html: htmlBody,
    template: "inbox_reply",
  });

  await prisma.emailMessage.create({
    data: {
      threadId,
      fromEmail: thread.creatorEmailAccount.emailAddress,
      toEmail,
      subject,
      textBody: body,
      htmlBody,
      direction: "OUTBOUND",
      status: "SENT",
      sentAt: new Date(),
    },
  });

  await prisma.emailThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date() } });

  await logActivity({
    actorId: session.id,
    action: `Replied in thread "${thread.subject}"`,
    entityType: "EmailThread",
    entityId: threadId,
  });

  revalidatePath(`/admin/inbox/${threadId}`);
}

const composeSchema = z.object({
  creatorEmailAccountId: z.string().min(1),
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

export async function sendComposeEmailAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = composeSchema.parse(Object.fromEntries(formData.entries()));

  const account = await prisma.creatorEmailAccount.findUniqueOrThrow({
    where: { id: data.creatorEmailAccountId },
  });

  const htmlBody = data.body.replace(/\n/g, "<br/>");

  await sendEmail({
    from: account.emailAddress,
    to: data.to,
    subject: data.subject,
    html: htmlBody,
    template: "inbox_compose",
  });

  const thread = await prisma.emailThread.create({
    data: {
      creatorEmailAccountId: account.id,
      subject: data.subject,
      lastMessageAt: new Date(),
      messages: {
        create: {
          fromEmail: account.emailAddress,
          toEmail: data.to,
          subject: data.subject,
          textBody: data.body,
          htmlBody,
          direction: "OUTBOUND",
          status: "SENT",
          sentAt: new Date(),
        },
      },
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Composed email "${data.subject}" to ${data.to}`,
    entityType: "EmailThread",
    entityId: thread.id,
  });

  revalidatePath("/admin/inbox");
  redirect(`/admin/inbox/${thread.id}`);
}

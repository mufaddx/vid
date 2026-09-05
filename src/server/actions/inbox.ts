"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

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

  await prisma.emailMessage.create({
    data: {
      threadId,
      fromEmail: thread.creatorEmailAccount.emailAddress,
      toEmail,
      subject: `Re: ${thread.subject}`,
      textBody: body,
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

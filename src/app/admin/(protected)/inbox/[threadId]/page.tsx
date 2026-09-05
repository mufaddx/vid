import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendInboxReplyAction } from "@/server/actions/inbox";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = await prisma.emailThread.findUnique({
    where: { id: threadId },
    include: {
      creatorEmailAccount: { include: { creator: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!thread) notFound();

  const reply = sendInboxReplyAction.bind(null, thread.id);

  return (
    <div>
      <PageHeader
        title={thread.subject}
        description={`${thread.creatorEmailAccount.creator.name} · ${thread.creatorEmailAccount.emailAddress}`}
      />
      <div className="p-8 max-w-3xl space-y-4">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-xl border p-4 text-sm max-w-lg",
              m.direction === "OUTBOUND" ? "ml-auto bg-violet-50 border-violet-200" : "bg-white border-neutral-200",
            )}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-medium text-neutral-600">{m.fromEmail}</span>
              <span>{formatDateTime(m.sentAt ?? m.receivedAt ?? m.createdAt)}</span>
            </div>
            <p className="text-neutral-800 whitespace-pre-wrap">{m.textBody}</p>
          </div>
        ))}

        <form action={reply} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
          <Textarea name="body" rows={4} placeholder={`Reply from ${thread.creatorEmailAccount.emailAddress}…`} required />
          <div className="flex justify-end">
            <Button type="submit">Send Reply</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

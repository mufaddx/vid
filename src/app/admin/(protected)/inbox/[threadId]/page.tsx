import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendInboxReplyAction } from "@/server/actions/inbox";
import { ContactNameEditor } from "@/components/admin/inbox/contact-name-editor";
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

  // Opening this page IS "reading" the thread — clear the unread flag
  // that drives the sidebar's Inbox badge.
  if (thread.unread) {
    await prisma.emailThread.update({ where: { id: threadId }, data: { unread: false } });
  }

  const reply = sendInboxReplyAction.bind(null, thread.id);
  const senderName = thread.creatorEmailAccount.creator?.name ?? thread.creatorEmailAccount.displayName;
  // The external party's address — whichever side of the conversation
  // isn't this mailbox. An inbound message always names them as the
  // sender; a thread that started as an outbound compose names them as
  // the very first message's recipient.
  const counterpartEmail =
    thread.messages.find((m) => m.direction === "INBOUND")?.fromEmail ?? thread.messages[0]?.toEmail ?? "—";

  return (
    <div>
      <PageHeader
        title={thread.subject}
        description={`${senderName ?? "Standalone mailbox"} · ${thread.creatorEmailAccount.emailAddress}${senderName ? "" : " (no sender name set)"}`}
      />
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
          <div>
            <div className="text-xs text-neutral-400">Conversation with</div>
            <div className="font-medium text-neutral-900">
              {thread.contactName ? (
                <>
                  {thread.contactName} <span className="text-neutral-400 font-normal">· {counterpartEmail}</span>
                </>
              ) : (
                counterpartEmail
              )}
            </div>
          </div>
          <ContactNameEditor threadId={thread.id} contactName={thread.contactName} />
        </div>

        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-xl border p-4 text-sm max-w-lg",
              m.direction === "OUTBOUND" ? "ml-auto bg-violet-50 border-violet-200" : "bg-white border-neutral-200",
            )}
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-medium text-neutral-600">
                {m.direction === "OUTBOUND" ? `To: ${m.toEmail}` : `From: ${thread.contactName ?? m.fromEmail}`}
              </span>
              <span>{formatDateTime(m.sentAt ?? m.receivedAt ?? m.createdAt)}</span>
            </div>
            <p className="text-neutral-800 whitespace-pre-wrap">{m.textBody}</p>
          </div>
        ))}

        <form action={reply} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
          <div className="text-xs text-neutral-400">
            Replying to <span className="font-medium text-neutral-600">{thread.contactName ?? counterpartEmail}</span>
            {thread.contactName ? <span className="text-neutral-400"> ({counterpartEmail})</span> : null}
          </div>
          <Textarea
            name="body"
            rows={4}
            placeholder={`Reply as ${senderName ? `${senderName} <${thread.creatorEmailAccount.emailAddress}>` : thread.creatorEmailAccount.emailAddress}…`}
            required
          />
          <input
            type="file"
            name="attachments"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100"
          />
          <div className="flex justify-end">
            <Button type="submit">Send Reply</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

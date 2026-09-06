import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { ComposeDialog } from "@/components/admin/inbox/compose-dialog";
import { MailboxFilter } from "@/components/admin/inbox/mailbox-filter";
import { timeAgo } from "@/lib/format";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ mailbox?: string }>;
}) {
  const { mailbox: mailboxId } = await searchParams;

  const [threads, mailboxes] = await Promise.all([
    prisma.emailThread.findMany({
      where: mailboxId ? { creatorEmailAccountId: mailboxId } : undefined,
      include: {
        creatorEmailAccount: { include: { creator: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    }),
    prisma.creatorEmailAccount.findMany({
      where: { status: "ACTIVE" },
      include: { creator: { select: { name: true } } },
      orderBy: { emailAddress: "asc" },
    }),
  ]);

  const mailboxOptions = mailboxes.map((m) => ({ id: m.id, emailAddress: m.emailAddress, creatorName: m.creator?.name ?? "Standalone" }));
  const selectedMailbox = mailboxId ? mailboxOptions.find((m) => m.id === mailboxId) : undefined;

  return (
    <div>
      <PageHeader
        title="Inbox"
        description={selectedMailbox ? `Mailbox: ${selectedMailbox.emailAddress}` : "Unified inbox across every creator mailbox"}
        actions={
          <div className="flex items-center gap-2">
            <MailboxFilter mailboxes={mailboxOptions} selectedId={mailboxId} />
            <ComposeDialog mailboxes={mailboxOptions} />
          </div>
        }
      />
      <div className="p-8">
        {threads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={selectedMailbox ? `No emails for ${selectedMailbox.emailAddress}` : "No emails in this inbox"}
            description="Threads from brand communications will appear here."
          />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/admin/inbox/${t.id}`}
                className={cn(
                  "flex items-center justify-between px-5 py-4 hover:bg-neutral-50",
                  t.unread ? "bg-violet-50/40" : undefined,
                )}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {t.unread ? <span className="mt-1.5 size-2 rounded-full bg-violet-600 shrink-0" title="Unread" /> : <span className="mt-1.5 size-2 shrink-0" />}
                  <div className="min-w-0">
                    <div className={cn("text-sm", t.unread ? "font-semibold text-neutral-900" : "font-medium text-neutral-800")}>
                      {t.subject}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      {t.contactName ? `${t.contactName} → ` : ""}
                      {t.creatorEmailAccount.creator?.name ?? "Standalone mailbox"} · {t.creatorEmailAccount.emailAddress}
                    </div>
                    {t.messages[0] ? (
                      <div className="text-xs text-neutral-500 mt-1 truncate max-w-md">{t.messages[0].textBody}</div>
                    ) : null}
                  </div>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">{timeAgo(t.lastMessageAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

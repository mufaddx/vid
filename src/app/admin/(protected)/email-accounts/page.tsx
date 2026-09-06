import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Mail } from "lucide-react";

export default async function EmailAccountsPage() {
  const accounts = await prisma.creatorEmailAccount.findMany({
    include: { creator: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Email Accounts"
        description="Official @vidlix.in mailboxes managed on behalf of creators"
      />
      <div className="p-8">
        {accounts.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No creator email accounts yet"
            description="Create one from a creator's profile — Email tab."
          />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-4 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-violet-600" />
                  <div>
                    <div className="font-medium">{a.emailAddress}</div>
                    {a.creator ? (
                      <Link href={`/admin/creators/${a.creatorId}`} className="text-xs text-neutral-400 hover:text-violet-600">
                        {a.creator.name}
                      </Link>
                    ) : (
                      <span className="text-xs text-neutral-400">Standalone mailbox — no creator assigned</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

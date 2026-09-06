import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { Mail } from "lucide-react";
import { AddEmailAccountDialog } from "@/components/admin/email-accounts/add-email-account-dialog";
import { EmailAccountsList } from "@/components/admin/email-accounts/email-accounts-list";

export default async function EmailAccountsPage() {
  const [accounts, creators] = await Promise.all([
    prisma.creatorEmailAccount.findMany({
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creator.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Email Accounts"
        description="Official @vidlix.in mailboxes — standalone or assigned to a creator"
        actions={<AddEmailAccountDialog creators={creators} />}
      />
      <div className="p-8">
        {accounts.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No email accounts yet"
            description="Create a mailbox — it doesn't need to be linked to a creator first."
            action={<AddEmailAccountDialog creators={creators} />}
          />
        ) : (
          <EmailAccountsList accounts={accounts} />
        )}
      </div>
    </div>
  );
}

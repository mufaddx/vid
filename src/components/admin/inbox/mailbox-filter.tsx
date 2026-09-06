"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Mailbox = { id: string; emailAddress: string; creatorName: string };

// URL-driven (not client-only state) so the filter survives a refresh,
// back/forward, or a direct link — matches how every other list filter
// in this admin panel is built.
export function MailboxFilter({ mailboxes, selectedId }: { mailboxes: Mailbox[]; selectedId?: string }) {
  const router = useRouter();

  return (
    <Select
      value={selectedId ?? "all"}
      onValueChange={(v) => router.push(v === "all" ? "/admin/inbox" : `/admin/inbox?mailbox=${v}`)}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="All Email Accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Email Accounts</SelectItem>
        {mailboxes.map((m) => (
          <SelectItem key={m.id} value={m.id}>{m.emailAddress}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

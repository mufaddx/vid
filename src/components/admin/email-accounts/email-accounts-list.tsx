"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Mail, Search, Inbox } from "lucide-react";

type Account = {
  id: string;
  emailAddress: string;
  status: string;
  displayName: string | null;
  creator: { id: string; name: string } | null;
};

// Client-side search over the already-fetched list — the list is small
// enough that a server round-trip per keystroke would be overkill, and
// this keeps the layout from ever jumping while typing.
export function EmailAccountsList({ accounts }: { accounts: Account[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        a.emailAddress.toLowerCase().includes(q) ||
        a.creator?.name.toLowerCase().includes(q) ||
        a.displayName?.toLowerCase().includes(q),
    );
  }, [accounts, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
        <Input
          placeholder="Search by email or creator name…"
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">No mailboxes match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
          {filtered.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-violet-600" />
                <div>
                  <div className="font-medium">{a.emailAddress}</div>
                  {a.creator ? (
                    <Link href={`/admin/creators/${a.creator.id}`} className="text-xs text-neutral-400 hover:text-violet-600">
                      {a.creator.name}
                    </Link>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      {a.displayName ? `${a.displayName} · Standalone mailbox` : "Standalone mailbox — no creator assigned"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/inbox?mailbox=${a.id}`}>
                    <Inbox className="size-4" /> View Mail
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

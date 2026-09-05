"use client";

import { useActionState } from "react";
import { createCreatorEmailAccountAction, type EmailAccountFormState } from "@/server/actions/email-accounts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import type { CreatorEmailAccount } from "@prisma/client";

export function EmailPanel({
  creatorId,
  accounts,
}: {
  creatorId: string;
  accounts: CreatorEmailAccount[];
}) {
  const action = createCreatorEmailAccountAction.bind(null, creatorId);
  const [state, formAction, pending] = useActionState<EmailAccountFormState, FormData>(
    action,
    undefined,
  );

  return (
    <div className="space-y-4">
      {accounts.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-4">
              <Mail className="size-4 text-violet-600" />
              <div>
                <div className="font-medium text-neutral-900">{a.emailAddress}</div>
                <div className="text-xs text-neutral-400">Managed by VIDLIX &middot; {a.status}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <form action={formAction} className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-5 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-neutral-500 mb-1 block">Create official VIDLIX email</label>
            <div className="flex items-center gap-2">
              <Input name="localPart" placeholder="rahul" className="bg-white" required />
              <span className="text-sm text-neutral-400">@vidlix.in</span>
            </div>
            {state?.error ? <p className="text-xs text-red-600 mt-1">{state.error}</p> : null}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create"}
          </Button>
        </form>
      )}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStandaloneEmailAccountAction,
  type EmailAccountFormState,
} from "@/server/actions/email-accounts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Creator = { id: string; name: string };

export function AddEmailAccountDialog({ creators }: { creators: Creator[] }) {
  const [open, setOpen] = useState(false);
  const [creatorId, setCreatorId] = useState("none");
  const [state, formAction, pending] = useActionState<EmailAccountFormState, FormData>(
    createStandaloneEmailAccountAction,
    undefined,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Add Email Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Email Account</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <div className="flex items-center gap-2">
              <Input name="localPart" placeholder="rahul" required />
              <span className="text-sm text-neutral-400">@vidlix.in</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="displayName" placeholder="e.g. Rahul Sharma" />
            <p className="text-xs text-neutral-400">
              Shown as the sender name on mail sent from this address (used only when no creator is
              assigned below — an assigned creator&rsquo;s own name is used instead).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Assign to Creator (optional)</Label>
            <input type="hidden" name="creatorId" value={creatorId === "none" ? "" : creatorId} />
            <Select value={creatorId} onValueChange={setCreatorId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="No creator — standalone mailbox" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No creator — standalone mailbox</SelectItem>
                {creators.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400">
              A mailbox can be created independently and assigned to a creator later.
            </p>
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

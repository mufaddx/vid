"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendComposeEmailAction } from "@/server/actions/inbox";
import { PenSquare } from "lucide-react";

type Mailbox = { id: string; emailAddress: string; creatorName: string };

export function ComposeDialog({ mailboxes }: { mailboxes: Mailbox[] }) {
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState(mailboxes[0]?.id ?? "");
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={mailboxes.length === 0}>
          <PenSquare className="size-4" /> Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Email</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            setPending(true);
            await sendComposeEmailAction(formData);
            setPending(false);
            setOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>From</Label>
            <input type="hidden" name="creatorEmailAccountId" value={fromId} />
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select a mailbox" /></SelectTrigger>
              <SelectContent>
                {mailboxes.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.emailAddress} ({m.creatorName})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input name="to" type="email" placeholder="recipient@example.com" required />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input name="subject" required />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea name="body" rows={8} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending || !fromId}>{pending ? "Sending…" : "Send"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

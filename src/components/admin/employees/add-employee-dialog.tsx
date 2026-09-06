"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeAction, type EmployeeFormState } from "@/server/actions/employees";
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

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "TALENT_MANAGER", label: "Talent Manager — Creators & Agreements" },
  { value: "CAMPAIGN_MANAGER", label: "Campaign Manager — Brands, Campaigns & Collaborations" },
  { value: "FINANCE_MANAGER", label: "Finance Manager — Billing" },
  { value: "INBOX_MANAGER", label: "Inbox Manager — Inbox & Email Accounts" },
  { value: "VIEWER", label: "Viewer — Dashboard & Reports only" },
  { value: "SUPER_ADMIN", label: "Super Admin — Full access" },
];

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<EmployeeFormState, FormData>(
    createEmployeeAction,
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
          <Plus className="size-4" /> Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" placeholder="Talent Manager" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role / Access *</Label>
            <Select name="role" defaultValue="VIEWER" required>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-400">
              Determines which admin panel sections this employee can see and use.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input id="password" name="password" type="text" minLength={8} required placeholder="At least 8 characters" />
            <p className="text-xs text-neutral-400">
              Share this with the employee — they log in the same way as any admin, at /admin/login.
            </p>
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

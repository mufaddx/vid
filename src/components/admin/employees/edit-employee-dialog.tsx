"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateEmployeeAction, type EmployeeFormState } from "@/server/actions/employees";
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
import { ManagedCreatorsPicker } from "@/components/admin/employees/managed-creators-picker";
import { Pencil } from "lucide-react";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "TALENT_MANAGER", label: "Talent Manager — Creators & Agreements" },
  { value: "CAMPAIGN_MANAGER", label: "Campaign Manager — Brands, Campaigns & Collaborations" },
  { value: "FINANCE_MANAGER", label: "Finance Manager — Billing" },
  { value: "INBOX_MANAGER", label: "Inbox Manager — Inbox & Email Accounts" },
  { value: "VIEWER", label: "Viewer — Dashboard & Reports only" },
  { value: "SUPER_ADMIN", label: "Super Admin — Full access" },
];

const CREATOR_SCOPED_ROLES = new Set(["TALENT_MANAGER", "CAMPAIGN_MANAGER"]);

type Creator = { id: string; name: string; profileImage: string | null };
type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  role: string;
};

export function EditEmployeeDialog({
  employee,
  creators,
  managedCreatorIds,
}: {
  employee: Employee;
  creators: Creator[];
  managedCreatorIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(employee.role);
  const action = updateEmployeeAction.bind(null, employee.id);
  const [state, formAction, pending] = useActionState<EmployeeFormState, FormData>(action, undefined);
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
        <Button variant="ghost" size="sm">
          <Pencil className="size-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {employee.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input id="edit-name" name="name" defaultValue={employee.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email *</Label>
              <Input id="edit-email" name="email" type="email" defaultValue={employee.email} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" name="phone" defaultValue={employee.phone ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input id="edit-designation" name="designation" defaultValue={employee.designation ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role / Access *</Label>
            <Select name="role" value={role} onValueChange={setRole} required>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {CREATOR_SCOPED_ROLES.has(role) ? (
            <div className="space-y-1.5">
              <Label>Managed Creators</Label>
              <ManagedCreatorsPicker name="managedCreatorIds" creators={creators} defaultSelected={managedCreatorIds} />
            </div>
          ) : null}

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

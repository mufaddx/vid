"use client";

import { useActionState } from "react";
import { createCreatorAction, type CreatorFormState } from "@/server/actions/creators";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewCreatorPage() {
  const [state, formAction, pending] = useActionState<CreatorFormState, FormData>(
    createCreatorAction,
    undefined,
  );

  return (
    <div>
      <PageHeader title="Add Creator" description="Onboard a new managed creator" />
      <form action={formAction} className="p-8 max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" name="name" required />
          <Field label="Category" name="category" placeholder="Fashion & Lifestyle" />
          <Field label="Email" name="email" type="email" />
          <Field label="Phone" name="phone" />
          <Field label="City" name="city" />
          <Field label="State" name="state" />
          <Field label="Journey Start Year" name="journeyStartYear" type="number" />
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select name="status" defaultValue="PENDING">
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Monthly Management Fee (₹)" name="managementFee" type="number" />
          <Field label="Commission Percentage (%)" name="commissionPercentage" type="number" defaultValue="30" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Short Bio</Label>
          <Textarea id="bio" name="bio" rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="longBio">Long Bio / Creator Story</Label>
          <Textarea id="longBio" name="longBio" rows={4} />
        </div>

        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create Creator"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}{required ? " *" : ""}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} />
    </div>
  );
}

"use client";

import { useActionState } from "react";
import type { Creator } from "@prisma/client";
import { updateCreatorAction, type CreatorFormState } from "@/server/actions/creators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SerializedCreator = Omit<Creator, "managementFee" | "commissionPercentage"> & {
  managementFee: number | null;
  commissionPercentage: number;
};

export function EditCreatorForm({ creator }: { creator: SerializedCreator }) {
  const action = updateCreatorAction.bind(null, creator.id);
  const [state, formAction, pending] = useActionState<CreatorFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name" name="name" defaultValue={creator.name} required />
        <Field label="Category" name="category" defaultValue={creator.category ?? ""} />
        <Field label="Email" name="email" type="email" defaultValue={creator.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={creator.phone ?? ""} />
        <Field label="City" name="city" defaultValue={creator.city ?? ""} />
        <Field label="State" name="state" defaultValue={creator.state ?? ""} />
        <Field label="Journey Start Year" name="journeyStartYear" type="number" defaultValue={String(creator.journeyStartYear ?? "")} />
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select name="status" defaultValue={creator.status}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label="Monthly Management Fee (₹)" name="managementFee" type="number" defaultValue={creator.managementFee ? String(creator.managementFee) : ""} />
        <Field label="Commission Percentage (%)" name="commissionPercentage" type="number" defaultValue={String(creator.commissionPercentage)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Short Bio</Label>
        <Textarea id="bio" name="bio" rows={2} defaultValue={creator.bio ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="longBio">Long Bio / Creator Story</Label>
        <Textarea id="longBio" name="longBio" rows={4} defaultValue={creator.longBio ?? ""} />
      </div>

      <div className="flex items-center gap-2">
        <Switch id="featured" name="featured" defaultChecked={creator.featured} />
        <Label htmlFor="featured">Featured on homepage orbit</Label>
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}{required ? " *" : ""}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
    </div>
  );
}

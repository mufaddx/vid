"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCreatorAction, type CreatorFormState } from "@/server/actions/creators";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { PhotoCropEditor } from "@/components/admin/creator/photo-crop-dialog";
import { Plus } from "lucide-react";

export function AddCreatorDialog({ triggerSize = "default" }: { triggerSize?: "default" | "sm" }) {
  const [open, setOpen] = useState(false);
  // Two-step flow: fill the form, then (once the creator actually exists
  // and has an id to attach a photo to) an optional photo step — a brand
  // new creator has nowhere to upload a photo to until it's created.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<CreatorFormState, FormData>(
    createCreatorAction,
    undefined,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.id) {
      setCreatedId(state.id);
    }
  }, [state]);

  function finish() {
    setOpen(false);
    setCreatedId(null);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCreatedId(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size={triggerSize}>
          <Plus className="size-4" /> Add Creator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{createdId ? "Add a Photo" : "Add Creator"}</DialogTitle>
        </DialogHeader>

        {createdId ? (
          <PhotoCropEditor creatorId={createdId} onDone={finish} onSkip={finish} />
        ) : (
          <form action={formAction} className="space-y-6">
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create Creator"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
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

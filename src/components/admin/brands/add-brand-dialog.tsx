"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrandAction, type BrandFormState } from "@/server/actions/brands";
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
import { Plus } from "lucide-react";

export function AddBrandDialog({ triggerSize = "default" }: { triggerSize?: "default" | "sm" }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BrandFormState, FormData>(
    createBrandAction,
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
        <Button size={triggerSize}>
          <Plus className="size-4" /> Add Brand
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Brand</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add Brand"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

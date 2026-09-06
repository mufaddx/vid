"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaignAction, type CampaignFormState } from "@/server/actions/brands";
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
import { Plus } from "lucide-react";

const CAMPAIGN_STATUSES = [
  "DRAFT",
  "PLANNING",
  "CREATOR_SELECTION",
  "NEGOTIATION",
  "AGREEMENT_PENDING",
  "ACTIVE",
  "CONTENT_REVIEW",
  "PUBLISHED",
  "COMPLETED",
  "CANCELLED",
];

type Brand = { id: string; name: string };

export function AddCampaignDialog({ brands, defaultBrandId }: { brands: Brand[]; defaultBrandId?: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<CampaignFormState, FormData>(
    createCampaignAction,
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
          <Plus className="size-4" /> New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Brand *</Label>
            <Select name="brandId" defaultValue={defaultBrandId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input id="budget" name="budget" type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select name="status" defaultValue="DRAFT">
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAMPAIGN_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Campaign"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

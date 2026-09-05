import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { createPayoutAction } from "@/server/actions/billing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function NewPayoutPage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string }>;
}) {
  const { creatorId } = await searchParams;
  const [creators, campaigns] = await Promise.all([
    prisma.creator.findMany({ orderBy: { name: "asc" } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" } }),
  ]);
  const selected = creators.find((c) => c.id === creatorId);

  return (
    <div>
      <PageHeader title="New Payout" description="Split a campaign value into VIDLIX commission and creator share" />
      <form action={createPayoutAction} className="p-8 max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label>Creator *</Label>
          <Select name="creatorId" defaultValue={selected?.id} required>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select creator" /></SelectTrigger>
            <SelectContent>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Campaign</Label>
          <Select name="campaignId">
            <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="grossAmount">Gross Campaign Value (₹) *</Label>
            <Input id="grossAmount" name="grossAmount" type="number" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commissionPercentage">Commission (%) *</Label>
            <Input id="commissionPercentage" name="commissionPercentage" type="number" min={0} max={100} defaultValue={selected ? String(selected.commissionPercentage) : "30"} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="adjustment">Adjustment (₹)</Label>
          <Input id="adjustment" name="adjustment" type="number" defaultValue={0} />
        </div>
        <Button type="submit">Create Payout</Button>
      </form>
    </div>
  );
}

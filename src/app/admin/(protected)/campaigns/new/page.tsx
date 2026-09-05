import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { createCampaignAction } from "@/server/actions/brands";
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

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string }>;
}) {
  const { brandId } = await searchParams;
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New Campaign" description="Create a campaign for a brand" />
      <form action={createCampaignAction} className="p-8 max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label>Brand *</Label>
          <Select name="brandId" defaultValue={brandId} required>
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
              {["DRAFT", "PLANNING", "CREATOR_SELECTION", "NEGOTIATION", "AGREEMENT_PENDING", "ACTIVE", "CONTENT_REVIEW", "PUBLISHED", "COMPLETED", "CANCELLED"].map((s) => (
                <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Create Campaign</Button>
      </form>
    </div>
  );
}

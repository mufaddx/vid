import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { createInvoiceAction } from "@/server/actions/billing";
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

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string; invoiceType?: string }>;
}) {
  const { creatorId, invoiceType } = await searchParams;

  const [creators, brands, campaigns] = await Promise.all([
    prisma.creator.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" } }),
  ]);

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const selected = creators.find((c) => c.id === creatorId);

  return (
    <div>
      <PageHeader title="New Invoice" description="Creator management or brand campaign invoice" />
      <form action={createInvoiceAction} className="p-8 max-w-2xl space-y-5">
        <div className="space-y-1.5">
          <Label>Invoice Type *</Label>
          <Select name="invoiceType" defaultValue={invoiceType ?? "CREATOR_MANAGEMENT"} required>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATOR_MANAGEMENT">Creator Management Invoice</SelectItem>
              <SelectItem value="BRAND_CAMPAIGN">Brand Collaboration Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Brand (for brand invoices)</Label>
            <Select name="brandId">
              <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" name="description" rows={2} placeholder="Creator Management Services — September 2026" required />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="subtotal">Amount (₹) *</Label>
            <Input id="subtotal" name="subtotal" type="number" min={0} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax">Tax (₹)</Label>
            <Input id="tax" name="tax" type="number" min={0} defaultValue={0} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discount">Discount (₹)</Label>
            <Input id="discount" name="discount" type="number" min={0} defaultValue={0} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={dueDate} required />
        </div>

        <Button type="submit">Create Invoice</Button>
      </form>
    </div>
  );
}

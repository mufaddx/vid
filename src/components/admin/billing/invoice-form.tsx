"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  AgreementPreviewFrame,
  PreviewDocTitle,
  PreviewMetaRow,
  PreviewTable,
} from "@/components/admin/agreement/preview-shell";
import { formatDate, formatINR } from "@/lib/format";

type Creator = { id: string; name: string; email: string | null };
type Brand = { id: string; name: string; email: string | null };
type Campaign = { id: string; name: string; brandId: string };

type InvoiceType = "CREATOR_MANAGEMENT" | "BRAND_CAMPAIGN";

export function InvoiceForm({
  creators,
  brands,
  campaigns,
  defaultCreatorId,
  defaultInvoiceType,
  defaultDueDate,
}: {
  creators: Creator[];
  brands: Brand[];
  campaigns: Campaign[];
  defaultCreatorId?: string;
  defaultInvoiceType?: string;
  defaultDueDate: string;
}) {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(
    defaultInvoiceType === "BRAND_CAMPAIGN" ? "BRAND_CAMPAIGN" : "CREATOR_MANAGEMENT",
  );
  const [creatorId, setCreatorId] = useState(defaultCreatorId ?? creators[0]?.id ?? "");
  const [brandId, setBrandId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [description, setDescription] = useState("");
  const [subtotal, setSubtotal] = useState<number | "">("");
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientTouched, setRecipientTouched] = useState(false);

  const isBrandInvoice = invoiceType === "BRAND_CAMPAIGN";
  const creatorName = creators.find((c) => c.id === creatorId)?.name ?? "—";
  const brandName = brands.find((b) => b.id === brandId)?.name ?? "—";

  // Auto-fill "Send Invoice To" from the selected party's email on file —
  // but never lock it: an admin who's typed their own override keeps it
  // even if they then change the creator/brand/type selection.
  useEffect(() => {
    if (recipientTouched) return;
    const auto = isBrandInvoice
      ? brands.find((b) => b.id === brandId)?.email
      : creators.find((c) => c.id === creatorId)?.email;
    setRecipientEmail(auto ?? "");
  }, [creatorId, brandId, isBrandInvoice, creators, brands, recipientTouched]);
  const campaignName = campaigns.find((c) => c.id === campaignId)?.name;
  const visibleCampaigns = brandId ? campaigns.filter((c) => c.brandId === brandId) : campaigns;

  const total = useMemo(() => (Number(subtotal) || 0) + tax - discount, [subtotal, tax, discount]);

  const billToName = isBrandInvoice ? brandName : creatorName;
  const billToSubtitle = campaignName
    ? `Campaign: ${campaignName}${isBrandInvoice ? ` · Creator: ${creatorName}` : ""}`
    : undefined;
  const invoiceTypeLabel = isBrandInvoice ? "Brand Collaboration Invoice" : "Creator Management Invoice";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form action={createInvoiceAction} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Invoice Type *</Label>
          <Select name="invoiceType" value={invoiceType} onValueChange={(v) => setInvoiceType(v as InvoiceType)} required>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATOR_MANAGEMENT">Creator Management Invoice</SelectItem>
              <SelectItem value="BRAND_CAMPAIGN">Brand Collaboration Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{isBrandInvoice ? "Creator (for campaign attribution) *" : "Creator *"}</Label>
          <Select name="creatorId" value={creatorId} onValueChange={setCreatorId} required>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select creator" /></SelectTrigger>
            <SelectContent>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isBrandInvoice ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Brand *</Label>
              <Select name="brandId" value={brandId} onValueChange={(v) => { setBrandId(v); setCampaignId(""); }} required>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Campaign (optional)</Label>
              <Select name="campaignId" value={campaignId || "none"} onValueChange={(v) => setCampaignId(v === "none" ? "" : v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {visibleCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            placeholder={isBrandInvoice ? "Brand Collaboration Campaign — September 2026" : "Creator Management Services — September 2026"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="subtotal">Amount (₹) *</Label>
            <Input id="subtotal" name="subtotal" type="number" min={0} value={subtotal} onChange={(e) => setSubtotal(e.target.value === "" ? "" : Number(e.target.value))} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax">Tax (₹)</Label>
            <Input id="tax" name="tax" type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discount">Discount (₹)</Label>
            <Input id="discount" name="discount" type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input id="dueDate" name="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recipientEmail">Send Invoice To</Label>
          <Input
            id="recipientEmail"
            name="recipientEmail"
            type="email"
            placeholder="Auto-filled from creator/brand email — editable"
            value={recipientEmail}
            onChange={(e) => { setRecipientEmail(e.target.value); setRecipientTouched(true); }}
          />
          <p className="text-xs text-neutral-400">
            Pre-filled when available, but never required to match — replace it with any address.
          </p>
        </div>

        <Button type="submit">Create Invoice</Button>
      </form>

      <div className="lg:sticky lg:top-6 self-start">
        <div className="text-xs text-neutral-400 mb-2 text-center">LIVE PREVIEW</div>
        <AgreementPreviewFrame>
          <PreviewDocTitle>{invoiceTypeLabel.toUpperCase()}</PreviewDocTitle>
          <PreviewMetaRow
            items={[
              { label: "Invoice No.", value: "Pending" },
              { label: "Invoice Date", value: formatDate(new Date()) },
              { label: "Due Date", value: dueDate ? formatDate(dueDate) : "—" },
            ]}
          />

          <div className="mb-4">
            <div className="text-[8px] text-neutral-400 mb-1">BILL TO</div>
            <div className="text-[12px] font-bold">{billToName}</div>
            {billToSubtitle ? <p className="text-[9px] text-neutral-600 mt-0.5">{billToSubtitle}</p> : null}
          </div>

          <PreviewTable
            columns={[{ key: "description", label: "Description" }, { key: "amount", label: "Amount", align: "right" }]}
            rows={[{ description: description || "—", amount: formatINR(Number(subtotal) || 0) }]}
          />

          <div className="flex justify-end mt-2">
            <div className="w-44 text-[9px] space-y-1">
              <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{formatINR(Number(subtotal) || 0)}</span></div>
              {tax > 0 ? <div className="flex justify-between text-neutral-500"><span>Tax</span><span>{formatINR(tax)}</span></div> : null}
              {discount > 0 ? <div className="flex justify-between text-neutral-500"><span>Discount</span><span>-{formatINR(discount)}</span></div> : null}
              <div className="flex justify-between font-bold text-violet-900 border-t border-violet-200 pt-1"><span>Total</span><span>{formatINR(total)}</span></div>
            </div>
          </div>

          <div className="inline-block mt-4 text-[8px] font-bold border border-neutral-800 px-2 py-1">PENDING</div>
        </AgreementPreviewFrame>
      </div>
    </div>
  );
}

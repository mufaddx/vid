"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { newSectionId, type AgreementSection } from "@/lib/agreement-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrandCollaborationAgreementAction, updateBrandCollaborationDetailsAction } from "@/server/actions/structured-agreements";
import {
  emptyBrandCollaborationDetails,
  computeBrandCollaborationTotals,
  DELIVERABLE_TYPES,
  AD_PLATFORMS,
  AUTHORIZATION_STATUSES,
  PRICING_CATEGORIES,
  deliverableAmount,
  deliverableLabel,
  adUsageLabel,
  type Deliverable,
  type PricingLineItem,
  type BrandCollaborationDetails,
} from "@/lib/agreement-details";
import { formatDate, formatINR } from "@/lib/format";
import {
  AgreementPreviewFrame,
  PreviewDocTitle,
  PreviewRelationshipBar,
  PreviewMetaRow,
  PreviewSectionHeading,
  PreviewTable,
  PreviewCustomSections,
  PreviewSignatureRow,
} from "@/components/admin/agreement/preview-shell";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

function newDeliverable(): Deliverable {
  return { id: Math.random().toString(36).slice(2, 9), type: "INSTAGRAM_REEL", quantity: 1, rate: 0 };
}
function newPricingItem(): PricingLineItem {
  return { id: Math.random().toString(36).slice(2, 9), category: "OTHER", description: "", quantity: 1, rate: 0, source: "manual" };
}

export function BrandCollaborationForm({
  creators,
  brands,
  campaigns,
  defaultCreatorId,
  defaultBrandId,
  defaultCampaignId,
  editAgreementId,
  initialDetails,
  readOnly,
}: {
  creators: { id: string; name: string }[];
  brands: { id: string; name: string; email: string | null; contactPerson: string | null }[];
  campaigns: { id: string; name: string; brandId: string }[];
  defaultCreatorId?: string;
  defaultBrandId?: string;
  defaultCampaignId?: string;
  editAgreementId?: string;
  initialDetails?: BrandCollaborationDetails;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [creatorId, setCreatorId] = useState(defaultCreatorId ?? creators[0]?.id ?? "");
  const [brandId, setBrandId] = useState(defaultBrandId ?? brands[0]?.id ?? "");
  const [campaignId, setCampaignId] = useState(defaultCampaignId ?? "");
  const [details, setDetails] = useState<BrandCollaborationDetails>(() => {
    if (initialDetails) return initialDetails;
    const base = emptyBrandCollaborationDetails();
    const brand = brands.find((b) => b.id === (defaultBrandId ?? brands[0]?.id));
    if (brand) {
      base.brandContactName = brand.contactPerson ?? "";
      base.brandContactEmail = brand.email ?? "";
    }
    return base;
  });
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const creatorName = creators.find((c) => c.id === creatorId)?.name ?? "Creator";
  const brandName = brands.find((b) => b.id === brandId)?.name ?? "Brand";

  const totals = useMemo(() => computeBrandCollaborationTotals(details), [details]);
  const visibleCampaigns = campaigns.filter((c) => c.brandId === brandId);

  function updateDeliverable(id: string, patch: Partial<Deliverable>) {
    setDetails((d) => ({ ...d, deliverables: d.deliverables.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }
  function updatePricingItem(id: string, patch: Partial<PricingLineItem>) {
    setDetails((d) => ({ ...d, extraPricingItems: d.extraPricingItems.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }
  function updateAd(id: string, patch: Partial<BrandCollaborationDetails["advertising"][number]>) {
    setDetails((d) => ({ ...d, advertising: d.advertising.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  }
  function addCustomSection() {
    setDetails((d) => ({
      ...d,
      customSections: [...d.customSections, { id: newSectionId(), heading: "New Section", body: "" }],
    }));
  }
  function updateCustomSection(id: string, patch: Partial<AgreementSection>) {
    setDetails((d) => ({
      ...d,
      customSections: d.customSections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }
  function removeCustomSection(id: string) {
    setDetails((d) => ({ ...d, customSections: d.customSections.filter((s) => s.id !== id) }));
  }
  function moveCustomSection(id: string, dir: -1 | 1) {
    setDetails((d) => {
      const i = d.customSections.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.customSections.length) return d;
      const next = [...d.customSections];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...d, customSections: next };
    });
  }

  async function handleSubmit() {
    setError(undefined);
    setSaved(false);
    if (!creatorId) return setError("Select a creator.");
    if (!brandId) return setError("Select a brand.");
    setPending(true);
    const res = editAgreementId
      ? await updateBrandCollaborationDetailsAction(editAgreementId, details)
      : await createBrandCollaborationAgreementAction({ creatorId, brandId, campaignId: campaignId || undefined, details });
    setPending(false);
    if (res.ok) {
      if (editAgreementId) {
        setSaved(true);
        router.refresh();
      } else {
        router.push(`/admin/agreements/${res.agreementId}`);
      }
    } else {
      setError(res.error);
    }
  }

  const fields = (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Brand *</Label>
          <Select
            value={brandId}
            onValueChange={(v) => {
              setBrandId(v);
              setCampaignId("");
              const b = brands.find((x) => x.id === v);
              if (b) setDetails((d) => ({ ...d, brandContactName: b.contactPerson ?? "", brandContactEmail: b.email ?? "" }));
            }}
          >
            <SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Creator *</Label>
          <Select value={creatorId} onValueChange={setCreatorId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select creator" /></SelectTrigger>
            <SelectContent>
              {creators.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Brand Contact Name</Label>
          <Input value={details.brandContactName} onChange={(e) => setDetails((d) => ({ ...d, brandContactName: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Brand Contact Email</Label>
          <Input type="email" value={details.brandContactEmail} onChange={(e) => setDetails((d) => ({ ...d, brandContactEmail: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Campaign (optional)</Label>
          <Select value={campaignId || "none"} onValueChange={(v) => setCampaignId(v === "none" ? "" : v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {visibleCampaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Creator Social / Contact Summary</Label>
          <Input
            placeholder="Instagram @handle · YouTube handle"
            value={details.creatorSocialSummary}
            onChange={(e) => setDetails((d) => ({ ...d, creatorSocialSummary: e.target.value }))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <Label>Campaign Details</Label>
        <Input
          placeholder="Campaign Name *"
          value={details.campaignName}
          onChange={(e) => setDetails((d) => ({ ...d, campaignName: e.target.value }))}
        />
        <Textarea
          rows={3}
          placeholder="Campaign description"
          value={details.campaignDescription}
          onChange={(e) => setDetails((d) => ({ ...d, campaignDescription: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Start Date</Label>
            <Input type="date" value={details.campaignStartDate} onChange={(e) => setDetails((d) => ({ ...d, campaignStartDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">End Date</Label>
            <Input type="date" value={details.campaignEndDate} onChange={(e) => setDetails((d) => ({ ...d, campaignEndDate: e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Deliverables</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDetails((d) => ({ ...d, deliverables: [...d.deliverables, newDeliverable()] }))}
          >
            <Plus className="size-4" /> Add Deliverable
          </Button>
        </div>
        {details.deliverables.length === 0 ? (
          <p className="text-sm text-neutral-400">No deliverables added.</p>
        ) : (
          <div className="space-y-2">
            {details.deliverables.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end border-b border-neutral-100 pb-2">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs text-neutral-500">Type</Label>
                  <Select value={item.type} onValueChange={(v) => updateDeliverable(item.id, { type: v as Deliverable["type"] })}>
                    <SelectTrigger className="w-full h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DELIVERABLE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {item.type === "OTHER" ? (
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs text-neutral-500">Label</Label>
                    <Input className="h-8 text-sm" value={item.label ?? ""} onChange={(e) => updateDeliverable(item.id, { label: e.target.value })} />
                  </div>
                ) : (
                  <div className="col-span-3" />
                )}
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-neutral-500">Qty</Label>
                  <Input type="number" min={1} className="h-8 text-sm" value={item.quantity} onChange={(e) => updateDeliverable(item.id, { quantity: Number(e.target.value) })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-neutral-500">Rate (₹)</Label>
                  <Input type="number" min={0} className="h-8 text-sm" value={item.rate} onChange={(e) => updateDeliverable(item.id, { rate: Number(e.target.value) })} />
                </div>
                <div className="col-span-1 text-xs text-neutral-600 pb-1.5 text-right">{formatINR(deliverableAmount(item))}</div>
                <div className="col-span-12 flex justify-end -mt-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDetails((d) => ({ ...d, deliverables: d.deliverables.filter((x) => x.id !== item.id) }))}>
                    <Trash2 className="size-4 text-neutral-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <Label className="mb-3 block">Paid Advertising / Media Usage</Label>
        <div className="space-y-3">
          {details.advertising.map((ad) => {
            const platformMeta = AD_PLATFORMS.find((p) => p.value === ad.platform)!;
            return (
              <div key={ad.id} className="border border-neutral-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{platformMeta.label}</span>
                  <div className="flex items-center gap-2">
                    <Switch checked={ad.enabled} onCheckedChange={(checked) => updateAd(ad.id, { enabled: checked })} />
                    <span className="text-xs text-neutral-500">{ad.enabled ? "Enabled" : "Not used"}</span>
                  </div>
                </div>
                {ad.enabled ? (
                  <div className="grid grid-cols-4 gap-2">
                    <Input placeholder="Usage type" className="h-8 text-sm" value={ad.usageType} onChange={(e) => updateAd(ad.id, { usageType: e.target.value })} />
                    <Input type="number" placeholder="Duration (days)" className="h-8 text-sm" value={ad.durationDays ?? ""} onChange={(e) => updateAd(ad.id, { durationDays: e.target.value ? Number(e.target.value) : null })} />
                    <Input type="number" placeholder="Fee (₹)" className="h-8 text-sm" value={ad.fee || ""} onChange={(e) => updateAd(ad.id, { fee: Number(e.target.value) })} />
                    <Select value={ad.authorizationStatus} onValueChange={(v) => updateAd(ad.id, { authorizationStatus: v as typeof ad.authorizationStatus })}>
                      <SelectTrigger className="w-full h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AUTHORIZATION_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="date" placeholder="Start" className="h-8 text-sm" value={ad.startDate ?? ""} onChange={(e) => updateAd(ad.id, { startDate: e.target.value || null })} />
                    <Input type="date" placeholder="End" className="h-8 text-sm" value={ad.endDate ?? ""} onChange={(e) => updateAd(ad.id, { endDate: e.target.value || null })} />
                    <Input placeholder="Notes" className="h-8 text-sm col-span-2" value={ad.notes ?? ""} onChange={(e) => updateAd(ad.id, { notes: e.target.value })} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-neutral-400 mt-2">
          Enabling advertising does not grant unlimited rights — usage type, duration and authorization status are recorded per platform.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Additional Pricing Items</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDetails((d) => ({ ...d, extraPricingItems: [...d.extraPricingItems, newPricingItem()] }))}
          >
            <Plus className="size-4" /> Add Item
          </Button>
        </div>
        {details.extraPricingItems.length === 0 ? (
          <p className="text-sm text-neutral-400">No additional charges (deliverables and enabled advertising are priced automatically below).</p>
        ) : (
          <div className="space-y-2">
            {details.extraPricingItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end border-b border-neutral-100 pb-2">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs text-neutral-500">Description</Label>
                  <Input className="h-8 text-sm" value={item.description} onChange={(e) => updatePricingItem(item.id, { description: e.target.value })} />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs text-neutral-500">Category</Label>
                  <Select value={item.category} onValueChange={(v) => updatePricingItem(item.id, { category: v as PricingLineItem["category"] })}>
                    <SelectTrigger className="w-full h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRICING_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-neutral-500">Qty</Label>
                  <Input type="number" min={1} className="h-8 text-sm" value={item.quantity} onChange={(e) => updatePricingItem(item.id, { quantity: Number(e.target.value) })} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-neutral-500">Rate (₹)</Label>
                  <Input type="number" min={0} className="h-8 text-sm" value={item.rate} onChange={(e) => updatePricingItem(item.id, { rate: Number(e.target.value) })} />
                </div>
                <div className="col-span-1 flex justify-end pb-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDetails((d) => ({ ...d, extraPricingItems: d.extraPricingItems.filter((x) => x.id !== item.id) }))}>
                    <Trash2 className="size-4 text-neutral-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Label className="text-violet-900">Tax (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            className="h-8 text-sm w-24 bg-white"
            value={details.taxPercentage}
            onChange={(e) => setDetails((d) => ({ ...d, taxPercentage: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-violet-700">
            <span>Subtotal</span><span>{formatINR(totals.subtotal)}</span>
          </div>
          {totals.tax > 0 ? (
            <div className="flex justify-between text-violet-700">
              <span>Tax</span><span>{formatINR(totals.tax)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-bold text-violet-900 text-base border-t border-violet-200 pt-1.5 mt-1.5">
            <span>Grand Total</span><span>{formatINR(totals.total)}</span>
          </div>
        </div>
        <p className="text-xs text-violet-500 mt-2">Calculated automatically from deliverables, enabled advertising and additional items.</p>
      </div>

      <div className="space-y-1.5">
        <Label>Payment Terms</Label>
        <Textarea rows={2} value={details.paymentTerms} onChange={(e) => setDetails((d) => ({ ...d, paymentTerms: e.target.value }))} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Custom Sections</Label>
          <Button type="button" size="sm" variant="outline" onClick={addCustomSection}>
            <Plus className="size-4" /> Add Section
          </Button>
        </div>
        {details.customSections.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Add any additional sections — Content Usage Rights, Termination Conditions,
            Confidentiality, etc. — with a custom heading and content. Unlimited sections; the
            document flows onto additional pages automatically.
          </p>
        ) : (
          <div className="space-y-4">
            {details.customSections.map((s, i) => (
              <div key={s.id} className="rounded-lg border border-neutral-100 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="font-medium"
                    placeholder="Section Heading"
                    value={s.heading}
                    onChange={(e) => updateCustomSection(s.id, { heading: e.target.value })}
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => moveCustomSection(s.id, -1)}>
                      <ChevronUp className="size-4 text-neutral-400" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" disabled={i === details.customSections.length - 1} onClick={() => moveCustomSection(s.id, 1)}>
                      <ChevronDown className="size-4 text-neutral-400" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomSection(s.id)}>
                      <Trash2 className="size-4 text-neutral-400" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Section content…"
                  value={s.body}
                  onChange={(e) => updateCustomSection(s.id, { body: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-600">Saved.</p> : null}

      {!readOnly ? (
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? "Saving…" : editAgreementId ? "Save Changes" : "Create Agreement"}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <fieldset disabled={readOnly} className={readOnly ? "opacity-70 pointer-events-none" : undefined}>
        {fields}
      </fieldset>
      <div className="lg:sticky lg:top-6 self-start">
        <div className="text-xs text-neutral-400 mb-2 text-center">LIVE PREVIEW</div>
        <AgreementPreviewFrame>
          <PreviewDocTitle>BRAND COLLABORATION AGREEMENT</PreviewDocTitle>
          <PreviewRelationshipBar parties={[brandName, "VIDLIX", creatorName]} />
          <PreviewMetaRow
            items={[
              { label: "Campaign", value: details.campaignName || "—" },
              { label: "Period", value: `${formatDate(details.campaignStartDate)} – ${formatDate(details.campaignEndDate)}` },
            ]}
          />

          <PreviewSectionHeading>Parties</PreviewSectionHeading>
          <PreviewTable
            columns={[{ key: "role", label: "Role" }, { key: "name", label: "Name / Contact" }]}
            rows={[
              { role: "Brand", name: `${brandName}${details.brandContactName ? ` — ${details.brandContactName}` : ""}` },
              { role: "Creator", name: `${creatorName}${details.creatorSocialSummary ? ` — ${details.creatorSocialSummary}` : ""}` },
            ]}
          />

          {details.deliverables.length > 0 ? (
            <>
              <PreviewSectionHeading>Deliverables</PreviewSectionHeading>
              <PreviewTable
                columns={[
                  { key: "type", label: "Deliverable" },
                  { key: "qty", label: "Qty", align: "right" },
                  { key: "amount", label: "Amount", align: "right" },
                ]}
                rows={details.deliverables.map((d) => ({
                  type: deliverableLabel(d),
                  qty: String(d.quantity),
                  amount: formatINR(deliverableAmount(d)),
                }))}
              />
            </>
          ) : null}

          {details.advertising.some((a) => a.enabled) ? (
            <>
              <PreviewSectionHeading>Paid Advertising</PreviewSectionHeading>
              <PreviewTable
                columns={[
                  { key: "platform", label: "Platform" },
                  { key: "fee", label: "Fee", align: "right" },
                ]}
                rows={details.advertising.filter((a) => a.enabled).map((a) => ({ platform: adUsageLabel(a), fee: formatINR(a.fee) }))}
              />
            </>
          ) : null}

          {totals.lineItems.length > 0 ? (
            <>
              <PreviewSectionHeading>Commercial Pricing</PreviewSectionHeading>
              <div className="flex justify-end">
                <div className="w-40 text-[9px] space-y-1">
                  <div className="flex justify-between text-neutral-500"><span>Subtotal</span><span>{formatINR(totals.subtotal)}</span></div>
                  {totals.tax > 0 ? <div className="flex justify-between text-neutral-500"><span>Tax</span><span>{formatINR(totals.tax)}</span></div> : null}
                  <div className="flex justify-between font-bold text-violet-900 border-t border-violet-200 pt-1"><span>Grand Total</span><span>{formatINR(totals.total)}</span></div>
                </div>
              </div>
            </>
          ) : null}

          {details.paymentTerms.trim() ? (
            <>
              <PreviewSectionHeading>Payment Terms</PreviewSectionHeading>
              <p className="text-[9px] text-neutral-700 text-justify leading-relaxed mb-1.5">{details.paymentTerms.trim()}</p>
            </>
          ) : null}

          <PreviewCustomSections sections={details.customSections} />

          <PreviewSignatureRow signers={["Brand Authorized Representative", "VIDLIX Authorized Representative", `Creator — ${creatorName}`]} />
        </AgreementPreviewFrame>
      </div>
    </div>
  );
}

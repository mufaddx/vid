"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  createCreatorManagementAgreementAction,
  updateCreatorManagementDetailsAction,
} from "@/server/actions/structured-agreements";
import {
  emptyCreatorManagementDetails,
  CHARGE_TYPES,
  SERVICE_PRESETS,
  type AdditionalService,
  type CreatorManagementDetails,
  type CreatorSocialHandles,
} from "@/lib/agreement-details";
import { newSectionId, type AgreementSection } from "@/lib/agreement-content";
import {
  AgreementPreviewFrame,
  PreviewDocTitle,
  PreviewMetaRow,
  PreviewSectionHeading,
  PreviewTable,
  PreviewCustomSections,
  PreviewSignatureRow,
} from "@/components/admin/agreement/preview-shell";
import { formatDate, formatINR } from "@/lib/format";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

function chargeLabel(v: string): string {
  return CHARGE_TYPES.find((c) => c.value === v)?.label ?? v;
}

function newService(): AdditionalService {
  return {
    id: Math.random().toString(36).slice(2, 9),
    name: SERVICE_PRESETS[0],
    chargeType: "MONTHLY",
    amount: 0,
    frequency: "",
    isFree: false,
  };
}

export function CreatorManagementForm({
  creators,
  socialByCreator = {},
  addressByCreator = {},
  defaultCreatorId,
  defaultCommission,
  editAgreementId,
  agreementNumber,
  initialDetails,
  readOnly,
}: {
  creators: { id: string; name: string; commissionPercentage: number }[];
  socialByCreator?: Record<string, CreatorSocialHandles>;
  addressByCreator?: Record<string, string>;
  defaultCreatorId?: string;
  defaultCommission: number;
  editAgreementId?: string;
  agreementNumber?: string;
  initialDetails?: CreatorManagementDetails;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [creatorId, setCreatorId] = useState(defaultCreatorId ?? creators[0]?.id ?? "");
  // The creator's profile-level default commission — no longer shown as a
  // single blanket figure in this document (superseded by the per-platform
  // commissions below), but still carried through to the Agreement record
  // for other parts of the app (creator listing, billing) that read it.
  const commission = creators.find((c) => c.id === creatorId)?.commissionPercentage ?? defaultCommission;
  const [details, setDetails] = useState<CreatorManagementDetails>(() => ({
    ...emptyCreatorManagementDetails(),
    ...initialDetails,
    socialHandles: initialDetails?.socialHandles ?? socialByCreator[creatorId] ?? {},
  }));
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const creatorName = creators.find((c) => c.id === creatorId)?.name ?? "Creator";
  const creatorAddress = addressByCreator[creatorId] ?? "";
  const hasAnyConnectedSocial = !!(details.socialHandles.instagram || details.socialHandles.youtube || details.socialHandles.facebook);

  function updateService(id: string, patch: Partial<AdditionalService>) {
    setDetails((d) => ({
      ...d,
      additionalServices: d.additionalServices.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
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
    setPending(true);
    const res = editAgreementId
      ? await updateCreatorManagementDetailsAction(editAgreementId, { commissionPercentage: commission, details })
      : await createCreatorManagementAgreementAction({ creatorId, commissionPercentage: commission, details });
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
      <div className="space-y-1.5">
        <Label>Creator *</Label>
        <Select
          value={creatorId}
          onValueChange={(v) => {
            setCreatorId(v);
            setDetails((d) => ({ ...d, socialHandles: socialByCreator[v] ?? {} }));
          }}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a creator" /></SelectTrigger>
          <SelectContent>
            {creators.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label>Agreement Date *</Label>
        <Input
          type="date"
          value={details.agreementDate}
          onChange={(e) => setDetails((d) => ({ ...d, agreementDate: e.target.value }))}
        />
        <p className="text-xs text-neutral-400">
          The date this Agreement is entered into. There is no end date — it stays in effect until
          terminated in writing via a separate Cancellation Agreement.
        </p>
      </div>

      {hasAnyConnectedSocial ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <Label className="mb-3 block">Per-Platform Commission</Label>
          <p className="text-xs text-neutral-400 mb-3">
            The commission VIDLIX earns for managing each of the Creator&rsquo;s connected accounts.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {details.socialHandles.instagram ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-500">Instagram (%)</Label>
                <Input
                  type="number" min={0} max={100} step="0.1"
                  value={details.platformCommissions.instagram ?? ""}
                  onChange={(e) => setDetails((d) => ({ ...d, platformCommissions: { ...d.platformCommissions, instagram: Number(e.target.value) } }))}
                />
              </div>
            ) : null}
            {details.socialHandles.youtube ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-500">YouTube (%)</Label>
                <Input
                  type="number" min={0} max={100} step="0.1"
                  value={details.platformCommissions.youtube ?? ""}
                  onChange={(e) => setDetails((d) => ({ ...d, platformCommissions: { ...d.platformCommissions, youtube: Number(e.target.value) } }))}
                />
              </div>
            ) : null}
            {details.socialHandles.facebook ? (
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-500">Facebook (%)</Label>
                <Input
                  type="number" min={0} max={100} step="0.1"
                  value={details.platformCommissions.facebook ?? ""}
                  onChange={(e) => setDetails((d) => ({ ...d, platformCommissions: { ...d.platformCommissions, facebook: Number(e.target.value) } }))}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Monthly Management Fee</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={details.monthlyFee.isFree}
              onCheckedChange={(checked) => setDetails((d) => ({ ...d, monthlyFee: { ...d.monthlyFee, isFree: checked } }))}
            />
            <span className="text-xs text-neutral-500">FREE / No Monthly Fee</span>
          </div>
        </div>
        <Input
          type="number"
          min={0}
          placeholder="Amount (₹)"
          value={details.monthlyFee.amount || ""}
          onChange={(e) => setDetails((d) => ({ ...d, monthlyFee: { ...d.monthlyFee, amount: Number(e.target.value) } }))}
        />
        {details.monthlyFee.isFree ? (
          <p className="text-xs text-emerald-600 mt-2">
            Currently FREE — the agreement will show &ldquo;No Monthly Management Fee&rdquo;. This amount stays on file
            so you can switch back to paid anytime without re-entering it; it isn&rsquo;t permanent.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <Label>Additional Services</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDetails((d) => ({ ...d, additionalServices: [...d.additionalServices, newService()] }))}
          >
            <Plus className="size-4" /> Add Service
          </Button>
        </div>
        {details.additionalServices.length === 0 ? (
          <p className="text-sm text-neutral-400">No additional services added.</p>
        ) : (
          <div className="space-y-3">
            {details.additionalServices.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-2 items-end border-b border-neutral-100 pb-3">
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs text-neutral-500">Service</Label>
                  <Select value={s.name} onValueChange={(v) => updateService(s.id, { name: v })}>
                    <SelectTrigger className="w-full h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SERVICE_PRESETS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-xs text-neutral-500">Charge Type</Label>
                  <Select value={s.chargeType} onValueChange={(v) => updateService(s.id, { chargeType: v as AdditionalService["chargeType"] })}>
                    <SelectTrigger className="w-full h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHARGE_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-neutral-500">Amount{s.isFree ? " (on file)" : ""}</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 text-sm"
                    value={s.amount || ""}
                    onChange={(e) => updateService(s.id, { amount: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-1.5 pb-1.5">
                  <Switch checked={s.isFree} onCheckedChange={(checked) => updateService(s.id, { isFree: checked })} />
                  <span className="text-xs text-neutral-500">FREE</span>
                </div>
                <div className="col-span-1 flex justify-end pb-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDetails((d) => ({ ...d, additionalServices: d.additionalServices.filter((x) => x.id !== s.id) }))}>
                    <Trash2 className="size-4 text-neutral-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Management Terms</Label>
        <Textarea
          rows={4}
          value={details.terms}
          onChange={(e) => setDetails((d) => ({ ...d, terms: e.target.value }))}
        />
        <p className="text-xs text-neutral-400 text-right">{details.terms.length} characters</p>
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
            Add any additional sections — Payment Terms, Content Usage Rights, Termination
            Conditions, Confidentiality, etc. — with a custom heading and content. Unlimited
            sections; the document flows onto additional pages automatically.
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
          <PreviewDocTitle>CREATOR MANAGEMENT AGREEMENT</PreviewDocTitle>
          <PreviewMetaRow
            items={[
              { label: "Agreement No.", value: agreementNumber ?? "Pending" },
              { label: "Agreement Date", value: formatDate(details.agreementDate) },
              { label: "Creator", value: creatorName },
              { label: "Address", value: creatorAddress || "—" },
            ]}
          />

          {hasAnyConnectedSocial ? (
            <>
              <PreviewSectionHeading>Creator&rsquo;s Social Media Accounts &amp; Commission</PreviewSectionHeading>
              <PreviewTable
                columns={[{ key: "platform", label: "Platform" }, { key: "username", label: "Username" }, { key: "commission", label: "Commission", align: "right" }]}
                rows={[
                  ...(details.socialHandles.instagram
                    ? [{ platform: "Instagram", username: `@${details.socialHandles.instagram}`, commission: details.platformCommissions.instagram != null ? `${details.platformCommissions.instagram}%` : "—" }]
                    : []),
                  ...(details.socialHandles.youtube
                    ? [{ platform: "YouTube", username: details.socialHandles.youtube, commission: details.platformCommissions.youtube != null ? `${details.platformCommissions.youtube}%` : "—" }]
                    : []),
                  ...(details.socialHandles.facebook
                    ? [{ platform: "Facebook", username: details.socialHandles.facebook, commission: details.platformCommissions.facebook != null ? `${details.platformCommissions.facebook}%` : "—" }]
                    : []),
                ]}
              />
            </>
          ) : null}

          <PreviewSectionHeading>Commercial Terms</PreviewSectionHeading>
          <PreviewTable
            columns={[{ key: "item", label: "Item" }, { key: "value", label: "Value", align: "right" }]}
            rows={[
              { item: "Monthly Management Fee", value: details.monthlyFee.isFree ? "FREE" : formatINR(details.monthlyFee.amount) },
            ]}
          />

          {details.additionalServices.length > 0 ? (
            <>
              <PreviewSectionHeading>Additional Services</PreviewSectionHeading>
              <PreviewTable
                columns={[
                  { key: "name", label: "Service" },
                  { key: "chargeType", label: "Charge" },
                  { key: "amount", label: "Amount", align: "right" },
                ]}
                rows={details.additionalServices.map((s) => ({
                  name: s.name,
                  chargeType: chargeLabel(s.chargeType),
                  amount: s.isFree ? "Included" : formatINR(s.amount),
                }))}
              />
            </>
          ) : null}

          <PreviewSectionHeading>Management Terms</PreviewSectionHeading>
          {details.terms.split("\n\n").filter((p) => p.trim()).map((para, i) => (
            <p key={i} className="text-[9px] text-neutral-700 text-justify leading-relaxed mb-1.5">{para.trim()}</p>
          ))}

          <PreviewCustomSections sections={details.customSections} />

          <PreviewSignatureRow signers={["VIDLIX Authorized Representative", `Creator — ${creatorName}`]} />
        </AgreementPreviewFrame>
      </div>
    </div>
  );
}

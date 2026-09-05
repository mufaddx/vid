"use client";

import { useActionState } from "react";
import type { CompanySettings } from "@prisma/client";
import { updateCompanySettingsAction, type SettingsFormState } from "@/server/actions/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SerializedCompanySettings = Omit<CompanySettings, "defaultCommissionPct"> & {
  defaultCommissionPct: number;
};

export function SettingsForm({ company }: { company: SerializedCompanySettings }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateCompanySettingsAction,
    undefined,
  );

  return (
    // A single form spans all three sub-tabs below — Radix keeps inactive
    // tab content mounted (just visually hidden), so switching tabs never
    // loses what's typed, and Save always submits everything at once.
    <form action={formAction} className="space-y-6">
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="billing">Billing Defaults</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="company" forceMount className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" name="companyName" defaultValue={company.companyName} />
            <Field label="Legal Name" name="legalName" defaultValue={company.legalName} />
            <Field label="Tagline" name="tagline" defaultValue={company.tagline} />
            <Field label="Email" name="email" type="email" defaultValue={company.email} />
            <Field label="Phone" name="phone" defaultValue={company.phone} />
            <Field label="Website" name="website" defaultValue={company.website} />
            <Field label="GSTIN" name="gstin" defaultValue={company.gstin ?? ""} />
            <Field label="CIN" name="cin" defaultValue={company.cin ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" rows={2} defaultValue={company.address} />
          </div>
        </TabsContent>

        <TabsContent value="billing" forceMount className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Default Commission (%)" name="defaultCommissionPct" type="number" defaultValue={String(company.defaultCommissionPct)} />
            <Field label="Default Due Days" name="defaultDueDays" type="number" defaultValue={String(company.defaultDueDays)} />
            <Field label="Agreement Prefix" name="agreementPrefix" defaultValue={company.agreementPrefix} />
            <Field label="Invoice Prefix" name="invoicePrefix" defaultValue={company.invoicePrefix} />
            <Field label="Receipt Prefix" name="receiptPrefix" defaultValue={company.receiptPrefix} />
            <Field label="Payment Prefix" name="paymentPrefix" defaultValue={company.paymentPrefix} />
            <Field label="Payout Prefix" name="payoutPrefix" defaultValue={company.payoutPrefix} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankDetails">Bank Details</Label>
            <Textarea id="bankDetails" name="bankDetails" rows={2} defaultValue={company.bankDetails ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="upiDetails">UPI Details</Label>
            <Input id="upiDetails" name="upiDetails" defaultValue={company.upiDetails ?? ""} />
          </div>
        </TabsContent>

        <TabsContent value="social" forceMount className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 data-[state=inactive]:hidden">
          <p className="text-xs text-neutral-400">
            Shown as icons in the website footer. Leave blank to hide a platform — never invented.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram URL" name="instagramUrl" defaultValue={company.instagramUrl ?? ""} />
            <Field label="YouTube URL" name="youtubeUrl" defaultValue={company.youtubeUrl ?? ""} />
            <Field label="Facebook URL" name="facebookUrl" defaultValue={company.facebookUrl ?? ""} />
            <Field label="X (Twitter) URL" name="xUrl" defaultValue={company.xUrl ?? ""} />
          </div>
        </TabsContent>
      </Tabs>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-600">Settings saved.</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}

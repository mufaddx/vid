"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAgreementAction } from "@/server/actions/agreements";
import { Plus, Users, Building2, FileText, ArrowLeft, ArrowRight } from "lucide-react";

type Person = { id: string; name: string };
type Brand = { id: string; name: string };
type Campaign = { id: string; name: string; brandId: string };
type Template = { id: string; name: string };

type Step = "select" | "creator-management" | "brand-collaboration" | "custom";

export function NewAgreementDialog({
  creators,
  brands,
  campaigns,
  templates,
}: {
  creators: Person[];
  brands: Brand[];
  campaigns: Campaign[];
  templates: Template[];
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setStep("select");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setStep("select");
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New Agreement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "select" ? "New Agreement" : "New Agreement"}
          </DialogTitle>
        </DialogHeader>

        {step === "select" ? (
          <div className="grid gap-3">
            <TypeOption
              icon={Users}
              title="Creator / Influencer Management Agreement"
              description="VIDLIX ↔ Creator. Commission, monthly management fee, additional services."
              onClick={() => setStep("creator-management")}
            />
            <TypeOption
              icon={Building2}
              title="Brand Collaboration Agreement"
              description="Brand × VIDLIX × Creator. Campaign deliverables, advertising usage, pricing."
              onClick={() => setStep("brand-collaboration")}
            />
            <TypeOption
              icon={FileText}
              title="Custom / Other"
              description="NDA, campaign letters and other template-based documents."
              onClick={() => setStep("custom")}
            />
          </div>
        ) : null}

        {step === "creator-management" ? (
          <CreatorManagementKickoff
            creators={creators}
            onBack={() => setStep("select")}
            onContinue={(creatorId) => {
              close();
              router.push(`/admin/agreements/new/creator-management${creatorId ? `?creatorId=${creatorId}` : ""}`);
            }}
          />
        ) : null}

        {step === "brand-collaboration" ? (
          <BrandCollaborationKickoff
            creators={creators}
            brands={brands}
            campaigns={campaigns}
            onBack={() => setStep("select")}
            onContinue={(qs) => {
              close();
              router.push(`/admin/agreements/new/brand-collaboration${qs ? `?${qs}` : ""}`);
            }}
          />
        ) : null}

        {step === "custom" ? (
          <CustomAgreementForm
            creators={creators}
            brands={brands}
            campaigns={campaigns}
            templates={templates}
            onBack={() => setStep("select")}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TypeOption({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left hover:border-violet-300 hover:shadow-sm transition-all"
    >
      <div className="size-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-neutral-900 text-sm">{title}</div>
        <div className="text-xs text-neutral-500 mt-0.5">{description}</div>
      </div>
      <ArrowRight className="size-4 text-neutral-300 group-hover:text-violet-500 transition-colors shrink-0" />
    </button>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 -mt-2 mb-1"
    >
      <ArrowLeft className="size-3.5" /> Back
    </button>
  );
}

function CreatorManagementKickoff({
  creators,
  onBack,
  onContinue,
}: {
  creators: Person[];
  onBack: () => void;
  onContinue: (creatorId?: string) => void;
}) {
  const [creatorId, setCreatorId] = useState<string | undefined>(undefined);
  return (
    <div className="space-y-4">
      <BackButton onBack={onBack} />
      <p className="text-sm text-neutral-500">
        Pick the creator to start their management agreement — you&apos;ll fill in commission,
        fees and terms with a live document preview on the next screen.
      </p>
      <div className="space-y-1.5">
        <Label>Creator</Label>
        <Select value={creatorId} onValueChange={setCreatorId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a creator" /></SelectTrigger>
          <SelectContent>
            {creators.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button onClick={() => onContinue(creatorId)}>
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function BrandCollaborationKickoff({
  creators,
  brands,
  campaigns,
  onBack,
  onContinue,
}: {
  creators: Person[];
  brands: Brand[];
  campaigns: Campaign[];
  onBack: () => void;
  onContinue: (qs: string) => void;
}) {
  const [creatorId, setCreatorId] = useState<string | undefined>(undefined);
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const filteredCampaigns = brandId ? campaigns.filter((c) => c.brandId === brandId) : campaigns;

  return (
    <div className="space-y-4">
      <BackButton onBack={onBack} />
      <p className="text-sm text-neutral-500">
        Pick the parties involved — deliverables, pricing and terms are filled in with a live
        document preview on the next screen.
      </p>
      <div className="space-y-1.5">
        <Label>Creator</Label>
        <Select value={creatorId} onValueChange={setCreatorId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a creator" /></SelectTrigger>
          <SelectContent>
            {creators.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Brand</Label>
        <Select value={brandId} onValueChange={(v) => { setBrandId(v); setCampaignId(undefined); }}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a brand" /></SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Campaign (optional)</Label>
        <Select value={campaignId} onValueChange={setCampaignId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            {filteredCampaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => {
            const params = new URLSearchParams();
            if (creatorId) params.set("creatorId", creatorId);
            if (brandId) params.set("brandId", brandId);
            if (campaignId) params.set("campaignId", campaignId);
            onContinue(params.toString());
          }}
        >
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function CustomAgreementForm({
  creators,
  brands,
  campaigns,
  templates,
  onBack,
}: {
  creators: Person[];
  brands: Brand[];
  campaigns: Campaign[];
  templates: Template[];
  onBack: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <form action={createAgreementAction} className="space-y-4">
      <BackButton onBack={onBack} />
      <div className="space-y-1.5">
        <Label>Template *</Label>
        <Select name="templateId" required defaultValue={templates[0]?.id}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a template" /></SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Creator *</Label>
        <Select name="creatorId" required>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select a creator" /></SelectTrigger>
          <SelectContent>
            {creators.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Brand (for brand collaboration templates)</Label>
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

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Date *</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={nextYear} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="commissionPercentage">Commission (%) *</Label>
          <Input id="commissionPercentage" name="commissionPercentage" type="number" step="0.1" min={0} max={100} defaultValue="30" required />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Generate Agreement</Button>
      </div>
    </form>
  );
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { createAgreementAction } from "@/server/actions/agreements";
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
import { getSession } from "@/lib/auth";
import { getManagedCreatorIds, creatorScopeWhere } from "@/lib/creator-scope";

export default async function NewAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string; brandId?: string }>;
}) {
  const { creatorId, brandId } = await searchParams;
  const session = await getSession();
  const scope = session ? await getManagedCreatorIds(session) : "ALL";

  const [templates, creators, brands, campaigns] = await Promise.all([
    // Creator Management and Brand Collaboration now have dedicated
    // structured flows (see /admin/agreements/new) — this template-based
    // path is for everything else (NDA, custom letters, etc.).
    prisma.agreementTemplate.findMany({
      where: { status: "ACTIVE", type: { notIn: ["CREATOR_MANAGEMENT", "BRAND_COLLABORATION"] } },
    }),
    prisma.creator.findMany({ where: creatorScopeWhere(scope), orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" } }),
  ]);

  const selectedCreator = creators.find((c) => c.id === creatorId);
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="New Custom Agreement" description="NDA, custom letters and other template-based documents" />
      <form action={createAgreementAction} className="p-8 max-w-2xl mx-auto space-y-5">
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
          <Select name="creatorId" required defaultValue={selectedCreator?.id}>
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
            <Label>Brand (for brand collaboration agreements)</Label>
            <Select name="brandId" defaultValue={brandId}>
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
            <Input
              id="commissionPercentage"
              name="commissionPercentage"
              type="number"
              step="0.1"
              min={0}
              max={100}
              defaultValue={selectedCreator ? String(selectedCreator.commissionPercentage) : "30"}
              required
            />
          </div>
        </div>

        <Button type="submit">Generate Agreement</Button>
      </form>
    </div>
  );
}

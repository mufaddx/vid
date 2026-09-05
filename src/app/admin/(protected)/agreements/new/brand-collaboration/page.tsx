import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { BrandCollaborationForm } from "@/components/admin/agreement/brand-collaboration-form";

export default async function NewBrandCollaborationAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string; brandId?: string; campaignId?: string }>;
}) {
  const { creatorId, brandId, campaignId } = await searchParams;

  const [creators, brands, campaigns] = await Promise.all([
    prisma.creator.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true, contactPerson: true } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brandId: true } }),
  ]);

  return (
    <div>
      <PageHeader title="New Brand Collaboration Agreement" description="Brand × VIDLIX × Creator · deliverables, advertising usage, pricing" />
      <div className="p-8">
        <BrandCollaborationForm
          creators={creators}
          brands={brands}
          campaigns={campaigns}
          defaultCreatorId={creatorId}
          defaultBrandId={brandId}
          defaultCampaignId={campaignId}
        />
      </div>
    </div>
  );
}

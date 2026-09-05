import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { CreatorManagementForm } from "@/components/admin/agreement/creator-management-form";
import { deriveSocialHandles, type CreatorSocialHandles } from "@/lib/agreement-details";

export default async function NewCreatorManagementAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string }>;
}) {
  const { creatorId } = await searchParams;

  const [creators, company] = await Promise.all([
    prisma.creator.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        commissionPercentage: true,
        address: true,
        city: true,
        state: true,
        country: true,
        socialAccounts: { select: { platform: true, username: true } },
      },
    }),
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
  ]);

  const socialByCreator: Record<string, CreatorSocialHandles> = {};
  const addressByCreator: Record<string, string> = {};
  for (const c of creators) {
    socialByCreator[c.id] = deriveSocialHandles(c.socialAccounts);
    addressByCreator[c.id] = [c.address, c.city, c.state, c.country].filter(Boolean).join(", ");
  }

  return (
    <div>
      <PageHeader title="New Creator Management Agreement" description="VIDLIX ↔ Creator · commission, monthly fee, additional services" />
      <div className="p-8">
        <CreatorManagementForm
          creators={creators.map((c) => ({ id: c.id, name: c.name, commissionPercentage: Number(c.commissionPercentage) }))}
          socialByCreator={socialByCreator}
          addressByCreator={addressByCreator}
          defaultCreatorId={creatorId}
          defaultCommission={Number(company.defaultCommissionPct)}
        />
      </div>
    </div>
  );
}

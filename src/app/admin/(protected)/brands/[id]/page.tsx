import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatDate, formatINR } from "@/lib/format";
import { Megaphone } from "lucide-react";
import { AddCampaignDialog } from "@/components/admin/campaigns/add-campaign-dialog";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      campaigns: { orderBy: { createdAt: "desc" } },
      invoices: true,
      agreements: { include: { creator: true } },
    },
  });
  if (!brand) notFound();

  const totalCampaignValue = brand.campaigns.reduce((s, c) => s + Number(c.budget ?? 0), 0);
  const pendingPayment = brand.invoices.reduce((s, i) => s + Number(i.pendingAmount), 0);

  return (
    <div>
      <PageHeader
        title={brand.name}
        description={brand.industry ?? "Brand"}
        actions={<AddCampaignDialog brands={[{ id: brand.id, name: brand.name }]} defaultBrandId={brand.id} />}
      />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs text-neutral-500">Total Campaigns</div>
            <div className="text-2xl font-semibold mt-1">{brand.campaigns.length}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs text-neutral-500">Total Campaign Value</div>
            <div className="text-2xl font-semibold mt-1">{formatINR(totalCampaignValue)}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs text-neutral-500">Pending Payment</div>
            <div className="text-2xl font-semibold mt-1 text-amber-600">{formatINR(pendingPayment)}</div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Campaigns</h3>
          {brand.campaigns.length === 0 ? (
            <EmptyState icon={Megaphone} title="No campaigns yet" />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
              {brand.campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-neutral-400">{formatDate(c.startDate)} – {formatDate(c.endDate)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-600">{formatINR(c.budget)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Agreements</h3>
          {brand.agreements.length === 0 ? (
            <p className="text-sm text-neutral-400">No agreements yet.</p>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
              {brand.agreements.map((a) => (
                <Link key={a.id} href={`/admin/agreements/${a.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-neutral-50">
                  <span>{a.agreementNumber} — {a.creator.name}</span>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

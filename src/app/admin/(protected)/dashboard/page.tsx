import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/empty-state";
import { formatCompactNumber, formatINR, timeAgo } from "@/lib/format";
import {
  Users,
  Building2,
  Megaphone,
  FileSignature,
  Wallet,
  Clock,
  Activity,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalCreators,
    activeCreators,
    pendingCreators,
    totalBrands,
    activeCampaigns,
    activeAgreements,
    pendingSignatures,
    activeCreatorsForFee,
    pendingBrandInvoices,
    payoutsPending,
    payoutsPaid,
    activityLogs,
    socialMetrics,
  ] = await Promise.all([
    prisma.creator.count(),
    prisma.creator.count({ where: { status: "ACTIVE" } }),
    prisma.creator.count({ where: { status: "PENDING" } }),
    prisma.brand.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.agreement.count({ where: { status: { in: ["ACTIVE", "SIGNED", "COMPLETED"] } } }),
    prisma.agreement.count({ where: { status: "PENDING_SIGNATURE" } }),
    prisma.creator.findMany({
      where: { status: "ACTIVE", managementFee: { not: null } },
      select: { managementFee: true },
    }),
    prisma.invoice.aggregate({
      where: { invoiceType: "BRAND_CAMPAIGN", status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] } },
      _sum: { pendingAmount: true },
    }),
    prisma.payout.aggregate({ where: { status: { in: ["PENDING", "APPROVED", "PROCESSING"] } }, _sum: { pendingAmount: true } }),
    prisma.payout.aggregate({ _sum: { commissionAmount: true } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { creator: true },
    }),
    prisma.socialMetric.findMany({ include: { socialAccount: true } }),
  ]);

  const mrr = activeCreatorsForFee.reduce((sum, c) => sum + Number(c.managementFee ?? 0), 0);

  const audienceTotals = { INSTAGRAM: 0, YOUTUBE: 0, FACEBOOK: 0 };
  for (const m of socialMetrics) {
    const platform = m.socialAccount.platform;
    audienceTotals[platform] += platform === "YOUTUBE" ? m.subscribers : m.followers;
  }
  const totalAudience = audienceTotals.INSTAGRAM + audienceTotals.YOUTUBE + audienceTotals.FACEBOOK;

  return (
    <div>
      <PageHeader title="Dashboard" description="VIDLIX operations at a glance" />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Creators" value={String(totalCreators)} icon={Users} hint={`${activeCreators} active · ${pendingCreators} pending`} />
          <StatCard label="Total Brands" value={String(totalBrands)} icon={Building2} />
          <StatCard label="Active Campaigns" value={String(activeCampaigns)} icon={Megaphone} />
          <StatCard label="Active Agreements" value={String(activeAgreements)} icon={FileSignature} hint={`${pendingSignatures} pending signature`} tone={pendingSignatures > 0 ? "warning" : "default"} />
          <StatCard label="Monthly Recurring Billing" value={formatINR(mrr)} icon={Wallet} />
          <StatCard label="Pending Brand Payments" value={formatINR(pendingBrandInvoices._sum.pendingAmount ?? 0)} tone="warning" icon={Clock} />
          <StatCard label="Pending Creator Payouts" value={formatINR(payoutsPending._sum.pendingAmount ?? 0)} tone="warning" icon={Wallet} />
          <StatCard label="Total VIDLIX Revenue" value={formatINR(payoutsPaid._sum.commissionAmount ?? 0)} tone="success" icon={Wallet} hint="Cumulative commission earned" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-medium text-neutral-500">Instagram</div>
            <div className="text-2xl font-semibold mt-1">{formatCompactNumber(audienceTotals.INSTAGRAM)}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-medium text-neutral-500">YouTube</div>
            <div className="text-2xl font-semibold mt-1">{formatCompactNumber(audienceTotals.YOUTUBE)}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-medium text-neutral-500">Facebook</div>
            <div className="text-2xl font-semibold mt-1">{formatCompactNumber(audienceTotals.FACEBOOK)}</div>
          </div>
          <div className="md:col-span-3 rounded-xl border border-violet-200 bg-violet-50 p-5 flex items-center justify-between">
            <span className="text-sm font-medium text-violet-900">Total Combined Creator Network Audience</span>
            <span className="text-2xl font-bold text-violet-900">{formatCompactNumber(totalAudience)}</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Recent Activity</h2>
          {activityLogs.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" description="Actions across creators, agreements and billing will show up here." />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <span className="text-neutral-800">{log.action}</span>
                    {log.creator ? (
                      <Link href={`/admin/creators/${log.creator.id}`} className="text-violet-600 ml-1 hover:underline">
                        {log.creator.name}
                      </Link>
                    ) : null}
                  </div>
                  <span className="text-xs text-neutral-400">{timeAgo(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

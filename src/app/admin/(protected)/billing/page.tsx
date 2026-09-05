import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import { Receipt, Wallet, Plus } from "lucide-react";

export default async function BillingOverviewPage() {
  const [invoices, payouts, pendingSum, overdueSum, payoutPendingSum] = await Promise.all([
    prisma.invoice.findMany({ include: { creator: true, brand: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.payout.findMany({ include: { creator: true, campaign: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.invoice.aggregate({ where: { status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID"] } }, _sum: { pendingAmount: true } }),
    prisma.invoice.aggregate({ where: { status: "OVERDUE" }, _sum: { pendingAmount: true } }),
    prisma.payout.aggregate({ where: { status: { in: ["PENDING", "APPROVED", "PROCESSING"] } }, _sum: { pendingAmount: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Invoices, payments and creator payouts"
        actions={
          <Button asChild>
            <Link href="/admin/billing/invoices/new"><Plus className="size-4" /> New Invoice</Link>
          </Button>
        }
      />
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Pending Invoices" value={formatINR(pendingSum._sum.pendingAmount ?? 0)} icon={Receipt} tone="warning" />
          <StatCard label="Overdue" value={formatINR(overdueSum._sum.pendingAmount ?? 0)} icon={Receipt} tone="warning" />
          <StatCard label="Pending Payouts" value={formatINR(payoutPendingSum._sum.pendingAmount ?? 0)} icon={Wallet} tone="warning" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <EmptyState icon={Receipt} title="No invoices yet" />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Bill To</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                      <TableCell>{inv.invoiceType === "BRAND_CAMPAIGN" ? inv.brand?.name : inv.creator?.name}</TableCell>
                      <TableCell>{formatINR(inv.total)}</TableCell>
                      <TableCell>{formatINR(inv.pendingAmount)}</TableCell>
                      <TableCell className="text-xs text-neutral-500">{formatDate(inv.dueDate)}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/billing/invoices/${inv.id}`}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Recent Payouts</h3>
          {payouts.length === 0 ? (
            <EmptyState icon={Wallet} title="No payouts yet" />
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Net Payable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.payoutNumber}</TableCell>
                      <TableCell>{p.creator.name}</TableCell>
                      <TableCell className="text-neutral-500">{p.campaign?.name ?? "—"}</TableCell>
                      <TableCell>{formatINR(p.netPayable)}</TableCell>
                      <TableCell><StatusBadge status={p.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/creators/${p.creator.id}`}>View Creator</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

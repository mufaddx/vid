import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber, formatINR } from "@/lib/format";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const creators = await prisma.creator.findMany({
    include: {
      socialAccounts: { include: { metric: true } },
      agreements: true,
      payouts: true,
      invoices: { where: { invoiceType: "BRAND_CAMPAIGN" } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Reports" description="Creator performance and revenue report" />
      <div className="p-8">
        {creators.length === 0 ? (
          <EmptyState icon={BarChart3} title="No data to report yet" />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Agreements</TableHead>
                  <TableHead>Brand Revenue</TableHead>
                  <TableHead>VIDLIX Commission</TableHead>
                  <TableHead>Creator Payout (Pending)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((c) => {
                  const revenue = c.invoices.reduce((s, i) => s + Number(i.total), 0);
                  const commission = c.payouts.reduce((s, p) => s + Number(p.commissionAmount), 0);
                  const pending = c.payouts.reduce((s, p) => s + Number(p.pendingAmount), 0);
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{formatCompactNumber(computeTotalAudience(c.socialAccounts))}</TableCell>
                      <TableCell>{c.agreements.length}</TableCell>
                      <TableCell>{formatINR(revenue)}</TableCell>
                      <TableCell>{formatINR(commission)}</TableCell>
                      <TableCell>{formatINR(pending)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

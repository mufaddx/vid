import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatINR } from "@/lib/format";
import { Megaphone } from "lucide-react";
import { AddCampaignDialog } from "@/components/admin/campaigns/add-campaign-dialog";

export default async function CampaignsPage() {
  const [campaigns, brands] = await Promise.all([
    prisma.campaign.findMany({
      include: { brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`}
        actions={<AddCampaignDialog brands={brands} />}
      />
      <div className="p-8">
        {campaigns.length === 0 ? (
          <EmptyState icon={Megaphone} title="No campaigns yet" action={<AddCampaignDialog brands={brands} />} />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <Link href={`/admin/brands/${c.brandId}`} className="text-violet-600 hover:underline">{c.brand.name}</Link>
                    </TableCell>
                    <TableCell>{formatINR(c.budget)}</TableCell>
                    <TableCell className="text-xs text-neutral-500">{formatDate(c.startDate)} – {formatDate(c.endDate)}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/brands/${c.brandId}`}>Open Brand</Link>
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
  );
}

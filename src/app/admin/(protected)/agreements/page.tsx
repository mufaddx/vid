import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { FileSignature, Plus } from "lucide-react";

export default async function AgreementsListPage() {
  const agreements = await prisma.agreement.findMany({
    include: { creator: true, brand: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Agreements"
        description={`${agreements.length} agreement${agreements.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/admin/agreements/new"><Plus className="size-4" /> New Agreement</Link>
          </Button>
        }
      />
      <div className="p-8">
        {agreements.length === 0 ? (
          <EmptyState icon={FileSignature} title="No agreements yet" description="Create your first agreement from a template." />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.agreementNumber}</TableCell>
                    <TableCell>{a.creator.name}</TableCell>
                    <TableCell className="text-neutral-500">{a.brand?.name ?? "—"}</TableCell>
                    <TableCell className="text-neutral-600 text-xs">{a.type.replaceAll("_", " ")}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-xs text-neutral-500">{formatDate(a.startDate)} – {formatDate(a.endDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/agreements/${a.id}`}>Open</Link>
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

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus } from "lucide-react";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Brands"
        description={`${brands.length} brand${brands.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/admin/brands/new"><Plus className="size-4" /> Add Brand</Link>
          </Button>
        }
      />
      <div className="p-8">
        {brands.length === 0 ? (
          <EmptyState icon={Building2} title="No brands yet" action={<Button asChild size="sm"><Link href="/admin/brands/new">Add Brand</Link></Button>} />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Campaigns</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-neutral-600">{b.industry ?? "—"}</TableCell>
                    <TableCell className="text-neutral-600">{b.contactPerson ?? "—"}</TableCell>
                    <TableCell>{b._count.campaigns}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/brands/${b.id}`}>View</Link>
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

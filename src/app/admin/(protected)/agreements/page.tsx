import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { FileSignature } from "lucide-react";
import type { AgreementType } from "@prisma/client";
import { NewAgreementDialog } from "@/components/admin/agreement/new-agreement-dialog";

const TYPE_FILTERS: { value: AgreementType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CREATOR_MANAGEMENT", label: "Creator Management" },
  { value: "BRAND_COLLABORATION", label: "Brand Collaboration" },
];

export default async function AgreementsListPage() {
  const [agreements, creators, brands, campaigns, templates] = await Promise.all([
    prisma.agreement.findMany({
      include: { creator: true, brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.creator.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brandId: true } }),
    prisma.agreementTemplate.findMany({
      where: { status: "ACTIVE", type: { notIn: ["CREATOR_MANAGEMENT", "BRAND_COLLABORATION"] } },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Agreements"
        description={`${agreements.length} agreement${agreements.length === 1 ? "" : "s"}`}
        actions={<NewAgreementDialog creators={creators} brands={brands} campaigns={campaigns} templates={templates} />}
      />
      <div className="p-8">
        {agreements.length === 0 ? (
          <EmptyState icon={FileSignature} title="No agreements yet" description="Create your first agreement." />
        ) : (
          <Tabs defaultValue="ALL">
            <TabsList>
              {TYPE_FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
              ))}
            </TabsList>
            {TYPE_FILTERS.map((f) => {
              const rows = f.value === "ALL" ? agreements : agreements.filter((a) => a.type === f.value);
              return (
                <TabsContent key={f.value} value={f.value} className="pt-6">
                  {rows.length === 0 ? (
                    <EmptyState icon={FileSignature} title={`No ${f.label.toLowerCase()} agreements`} />
                  ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agreement</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">{a.agreementNumber}</TableCell>
                              <TableCell className="text-neutral-700">
                                {a.type === "BRAND_COLLABORATION"
                                  ? `${a.brand?.name ?? "Brand"} × VIDLIX × ${a.creator.name}`
                                  : `VIDLIX ↔ ${a.creator.name}`}
                              </TableCell>
                              <TableCell className="text-neutral-500 text-xs">{a.type.replaceAll("_", " ")}</TableCell>
                              <TableCell><StatusBadge status={a.status} /></TableCell>
                              <TableCell className="text-xs text-neutral-500">
                                {a.type === "BRAND_COLLABORATION" || a.endDate
                                  ? `${formatDate(a.startDate)} – ${formatDate(a.endDate)}`
                                  : formatDate(a.startDate)}
                              </TableCell>
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
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}

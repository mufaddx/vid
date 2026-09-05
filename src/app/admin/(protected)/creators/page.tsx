import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber } from "@/lib/format";
import { Plus, Users } from "lucide-react";

export default async function AdminCreatorsPage() {
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { socialAccounts: { include: { metric: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Creators"
        description={`${creators.length} managed creator${creators.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/admin/creators/new">
              <Plus className="size-4" /> Add Creator
            </Link>
          </Button>
        }
      />
      <div className="p-8">
        {creators.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No creators yet"
            description="Onboard your first managed creator to get started."
            action={
              <Button asChild size="sm">
                <Link href="/admin/creators/new">Add Creator</Link>
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={c.profileImage ?? undefined} />
                          <AvatarFallback>{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-neutral-900">{c.name}</div>
                          <div className="text-xs text-neutral-400">/{c.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-600">{c.category ?? "—"}</TableCell>
                    <TableCell className="font-medium">{formatCompactNumber(computeTotalAudience(c.socialAccounts))}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>{c.featured ? "Yes" : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/creators/${c.id}`}>View</Link>
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

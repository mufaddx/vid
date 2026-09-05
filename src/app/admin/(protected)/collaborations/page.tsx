import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Handshake } from "lucide-react";

export default async function CollaborationsPage() {
  const collaborations = await prisma.collaboration.findMany({
    include: { brand: true, campaign: true, creators: { include: { creator: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Collaborations" description={`${collaborations.length} collaboration${collaborations.length === 1 ? "" : "s"}`} />
      <div className="p-8">
        {collaborations.length === 0 ? (
          <EmptyState icon={Handshake} title="No collaborations yet" />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {collaborations.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4 text-sm">
                <div>
                  <div className="font-medium text-neutral-900">
                    {c.brand.name}{c.campaign ? ` · ${c.campaign.name}` : ""}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {c.creators.map((cc) => (
                      <Link key={cc.id} href={`/admin/creators/${cc.creatorId}`} className="text-violet-600 hover:underline mr-2">
                        {cc.creator.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

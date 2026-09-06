import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EditCreatorForm } from "@/components/admin/creator/edit-form";

export default async function EditCreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = await prisma.creator.findUnique({ where: { id } });
  if (!creator) notFound();

  return (
    <div>
      <PageHeader title={`Edit ${creator.name}`} description="Update creator profile details" />
      <div className="p-8 max-w-2xl mx-auto">
        <EditCreatorForm
          creator={{
            ...creator,
            managementFee: creator.managementFee ? Number(creator.managementFee) : null,
            commissionPercentage: Number(creator.commissionPercentage),
          }}
        />
      </div>
    </div>
  );
}

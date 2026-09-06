import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { InvoiceForm } from "@/components/admin/billing/invoice-form";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string; invoiceType?: string }>;
}) {
  const { creatorId, invoiceType } = await searchParams;

  const [creators, brands, campaigns] = await Promise.all([
    prisma.creator.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.campaign.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, brandId: true } }),
  ]);

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="New Invoice" description="Creator management or brand campaign invoice" />
      <div className="p-8">
        <InvoiceForm
          creators={creators}
          brands={brands}
          campaigns={campaigns}
          defaultCreatorId={creatorId}
          defaultInvoiceType={invoiceType}
          defaultDueDate={dueDate}
        />
      </div>
    </div>
  );
}

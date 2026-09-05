import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recordPaymentAction } from "@/server/actions/billing";
import { formatDate, formatINR } from "@/lib/format";
import { Download } from "lucide-react";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { creator: true, brand: true, campaign: true, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!invoice) notFound();

  const isSettled = invoice.status === "PAID" || invoice.status === "CANCELLED";
  const recordPayment = recordPaymentAction.bind(null, invoice.id);

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`${invoice.invoiceType.replaceAll("_", " ")} · ${invoice.invoiceType === "BRAND_CAMPAIGN" ? invoice.brand?.name : invoice.creator?.name}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            {invoice.pdfAssetId ? (
              <Button asChild variant="outline">
                <a href={`/api/files/${invoice.pdfAssetId}`} target="_blank">
                  <Download className="size-4" /> Invoice PDF
                </a>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="p-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="text-sm text-neutral-500 mb-4">{invoice.description}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Row label="Creator" value={invoice.creator?.name ?? "—"} />
              {invoice.brand ? <Row label="Brand" value={invoice.brand.name} /> : null}
              {invoice.campaign ? <Row label="Campaign" value={invoice.campaign.name} /> : null}
              <Row label="Issue Date" value={formatDate(invoice.issueDate)} />
              <Row label="Due Date" value={formatDate(invoice.dueDate)} />
              <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
              <Row label="Tax" value={formatINR(invoice.tax)} />
              <Row label="Discount" value={`-${formatINR(invoice.discount)}`} />
              <Row label="Total" value={formatINR(invoice.total)} emphasis />
              <Row label="Paid" value={formatINR(invoice.paidAmount)} tone="success" />
              <Row label="Pending" value={formatINR(invoice.pendingAmount)} tone={Number(invoice.pendingAmount) > 0 ? "warning" : undefined} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Payment History</h3>
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-neutral-400">No payments recorded yet.</p>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <div className="font-medium">{p.paymentNumber}</div>
                      <div className="text-xs text-neutral-400">{p.method}{p.transactionReference ? ` · ${p.transactionReference}` : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatINR(p.amount)}</div>
                      <div className="text-xs text-neutral-400">{formatDate(p.paymentDate)}</div>
                    </div>
                    {p.receiptPdfAssetId ? (
                      <a href={`/api/files/${p.receiptPdfAssetId}`} target="_blank" className="text-xs text-violet-600 hover:underline">
                        Receipt
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isSettled ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 h-fit">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4">Record Payment</h3>
            <form action={recordPayment} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input id="amount" name="amount" type="number" min={0} max={Number(invoice.pendingAmount)} defaultValue={Number(invoice.pendingAmount)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Method *</Label>
                <Select name="method" defaultValue="Bank Transfer" required>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transactionReference">Transaction Reference</Label>
                <Input id="transactionReference" name="transactionReference" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utr">UTR</Label>
                <Input id="utr" name="utr" />
              </div>
              <Button type="submit" className="w-full">Record Payment</Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "success" | "warning";
}) {
  return (
    <div>
      <div className="text-xs text-neutral-400">{label}</div>
      <div
        className={
          emphasis
            ? "font-semibold text-neutral-900"
            : tone === "success"
              ? "font-medium text-emerald-600"
              : tone === "warning"
                ? "font-medium text-amber-600"
                : "text-neutral-700"
        }
      >
        {value}
      </div>
    </div>
  );
}

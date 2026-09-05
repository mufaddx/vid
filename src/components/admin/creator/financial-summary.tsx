import { formatINR } from "@/lib/format";

export function FinancialSummary({
  managementFee,
  totalBrandRevenue,
  vidlixCommission,
  creatorEarnings,
  paid,
  pendingPayout,
  outstandingInvoice,
}: {
  managementFee: number;
  totalBrandRevenue: number;
  vidlixCommission: number;
  creatorEarnings: number;
  paid: number;
  pendingPayout: number;
  outstandingInvoice: number;
}) {
  const rows: [string, string, string?][] = [
    ["Monthly Management Fee", formatINR(managementFee)],
    ["Total Brand Revenue", formatINR(totalBrandRevenue)],
    ["VIDLIX Commission", formatINR(vidlixCommission)],
    ["Creator Earnings", formatINR(creatorEarnings)],
    ["Paid", formatINR(paid), "success"],
    ["Pending Payout", formatINR(pendingPayout), pendingPayout > 0 ? "warning" : undefined],
    ["Outstanding Management Invoice", formatINR(outstandingInvoice), outstandingInvoice > 0 ? "warning" : undefined],
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
      {rows.map(([label, value, tone]) => (
        <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
          <span className="text-neutral-500">{label}</span>
          <span
            className={
              tone === "warning"
                ? "font-semibold text-amber-600"
                : tone === "success"
                  ? "font-semibold text-emerald-600"
                  : "font-semibold text-neutral-900"
            }
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

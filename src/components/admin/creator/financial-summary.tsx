import { formatINR } from "@/lib/format";
import { Wallet, TrendingUp, Percent, PiggyBank, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "success" | "warning";

const TONE_STYLES: Record<Tone, { value: string; iconBg: string; iconColor: string }> = {
  default: { value: "text-neutral-900", iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  success: { value: "text-emerald-600", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  warning: { value: "text-amber-600", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
};

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
  const tiles: { label: string; value: number; icon: LucideIcon; tone: Tone }[] = [
    { label: "Monthly Management Fee", value: managementFee, icon: Wallet, tone: "default" },
    { label: "Total Brand Revenue", value: totalBrandRevenue, icon: TrendingUp, tone: "default" },
    { label: "VIDLIX Commission", value: vidlixCommission, icon: Percent, tone: "default" },
    { label: "Creator Earnings", value: creatorEarnings, icon: PiggyBank, tone: "default" },
    { label: "Paid", value: paid, icon: CheckCircle2, tone: "success" },
    { label: "Pending Payout", value: pendingPayout, icon: Clock, tone: pendingPayout > 0 ? "warning" : "default" },
    { label: "Outstanding Invoice", value: outstandingInvoice, icon: AlertCircle, tone: outstandingInvoice > 0 ? "warning" : "default" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tiles.map(({ label, value, icon: Icon, tone }) => {
        const styles = TONE_STYLES[tone];
        return (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm hover:border-neutral-300 transition-all"
          >
            <div className={`inline-flex items-center justify-center size-8 rounded-lg ${styles.iconBg} mb-3`}>
              <Icon className={`size-4 ${styles.iconColor}`} />
            </div>
            <div className="text-xs text-neutral-500 leading-tight mb-1">{label}</div>
            <div className={`text-lg font-bold tracking-tight ${styles.value}`}>{formatINR(value)}</div>
          </div>
        );
      })}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  // greens
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SIGNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONNECTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ONBOARDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONVERTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // amber/warning
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING_SIGNATURE: "bg-amber-50 text-amber-700 border-amber-200",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRING_SOON: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  NEW: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  ISSUED: "bg-amber-50 text-amber-700 border-amber-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  // red
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  EXPIRED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  ERROR: "bg-red-50 text-red-700 border-red-200",
  // neutral
  DRAFT: "bg-neutral-100 text-neutral-600 border-neutral-200",
  INACTIVE: "bg-neutral-100 text-neutral-600 border-neutral-200",
  ARCHIVED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  NOT_CONNECTED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  CLOSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", TONE[status] ?? "bg-neutral-100 text-neutral-600 border-neutral-200")}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}

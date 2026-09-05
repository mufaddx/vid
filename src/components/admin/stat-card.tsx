import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">{label}</span>
        {Icon ? <Icon className="size-4 text-neutral-400" /> : null}
      </div>
      <div
        className={cn(
          "text-2xl font-semibold mt-2",
          tone === "warning" && "text-amber-600",
          tone === "success" && "text-emerald-600",
          tone === "default" && "text-neutral-900",
        )}
      >
        {value}
      </div>
      {hint ? <div className="text-xs text-neutral-400 mt-1">{hint}</div> : null}
    </div>
  );
}

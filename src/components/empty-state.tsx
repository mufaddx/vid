import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// Professional empty states everywhere instead of blank screens (spec §160).
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
      {Icon ? <Icon className="size-8 text-neutral-300 mb-3" /> : null}
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      {description ? (
        <p className="text-sm text-neutral-400 mt-1 max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-violet-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {description ? (
          <p className="text-sm text-neutral-500 mt-1">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

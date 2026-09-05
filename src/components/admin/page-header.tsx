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
    <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-8 py-4 border-b border-violet-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900 leading-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

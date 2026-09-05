import type { ReactNode } from "react";

// Shared on-screen A4 letterhead chrome for every agreement live preview
// (legacy section editor + both structured forms) — mirrors the actual
// PDF letterhead (logo mark, tagline, service strip, watermark, footer)
// so what the admin sees while editing matches what gets generated.

// Same simplified real-icon shapes as src/lib/pdf/social-icons.tsx (react-pdf
// can't share literal SVG components with the browser, so this is the HTML
// twin — keep the two in sync if the icon set changes).
const SOCIAL_ICON_DEFS = [
  {
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[9px]">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path
          d="M13.8 21v-7.6h2.6l.4-3h-3V8.5c0-.87.24-1.46 1.49-1.46h1.6V4.35c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.98v2.19H8.7v3h2.1V21h3z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[9px]">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[9px]">
        <rect x="1" y="5" width="22" height="14" rx="4" fill="currentColor" />
        <polygon points="10,9 16,12 10,15" fill="white" />
      </svg>
    ),
  },
  {
    label: "X",
    svg: (
      <svg viewBox="0 0 24 24" className="size-[9px]">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path d="M7 7l10 10M17 7L7 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function SocialIconsRow() {
  return (
    <div className="flex items-center gap-2.5">
      {SOCIAL_ICON_DEFS.map(({ label, svg }) => (
        <span key={label} className="flex items-center gap-1 text-violet-600">
          {svg}
          <span className="text-[6.5px] text-neutral-400">vidlix.in</span>
        </span>
      ))}
    </div>
  );
}

export function AgreementPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto bg-white shadow-md border border-neutral-200 aspect-[210/297] w-full max-w-[560px] overflow-y-auto overflow-x-hidden p-10 text-[11px] leading-relaxed text-neutral-800">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-violet-600" />
      <div className="pointer-events-none absolute -right-6 top-32 text-[64px] font-black tracking-widest text-violet-50 -rotate-[32deg] select-none">
        VIDLIX
      </div>

      <div className="relative flex flex-col min-h-full">
        <div className="flex items-start justify-between pb-1 mb-2">
          <div>
            <div className="font-black tracking-wide text-lg leading-none">
              VIDLI<span className="text-violet-600">X</span>
            </div>
            <div className="text-[7px] text-violet-600 tracking-widest mt-1.5">CREATORS • BRANDS • BEYOND</div>
          </div>
          <div className="text-right text-[8.5px] text-neutral-400 leading-snug">
            <div className="text-neutral-800 font-semibold">hello@vidlix.in</div>
            <div>vidlix.in</div>
            <div>+91 74887 16130</div>
          </div>
        </div>
        <div className="h-[2px] bg-violet-600 rounded-full mt-2" />
        <div className="text-center text-[6px] tracking-widest text-violet-300 border-t border-violet-100 mt-1.5 pt-1.5 mb-6">
          INFLUENCER MANAGEMENT · BRAND COLLABORATIONS · CONTENT STRATEGY · TALENT GROWTH
        </div>

        <div className="flex-1">{children}</div>

        <div className="flex items-center justify-center gap-3 border-t border-neutral-100 mt-8 pt-2.5">
          <SocialIconsRow />
        </div>
      </div>
    </div>
  );
}

export function PreviewDocTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 bg-violet-600 rounded-full" />
      <div className="font-bold text-sm tracking-wide">{children}</div>
    </div>
  );
}

export function PreviewRelationshipBar({ parties }: { parties: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 bg-violet-800 text-white rounded-lg py-2 mb-4 text-[9px] font-bold tracking-wide">
      {parties.map((p, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 ? <span className="text-violet-300">×</span> : null}
          {p.toUpperCase()}
        </span>
      ))}
    </div>
  );
}

export function PreviewMetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 text-[9px] mb-6 bg-violet-50/70 border border-violet-100 rounded-lg px-4 py-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-violet-500 text-[7px] tracking-wide">{item.label.toUpperCase()}</div>
          <div className="font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export function PreviewSectionHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5 mt-4 first:mt-0">
      <div className="size-1 rounded-full bg-violet-600" />
      <div className="font-semibold text-[10px] tracking-wide text-violet-900">{children.toUpperCase()}</div>
    </div>
  );
}

export function PreviewTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; align?: "left" | "right" }[];
  rows: Record<string, string>[];
}) {
  return (
    <div className="border border-violet-100 rounded-lg overflow-hidden mb-3">
      <div className="flex bg-violet-50/70 px-3 py-1.5 text-[7px] font-semibold text-violet-500 tracking-wide">
        {columns.map((c) => (
          <div key={c.key} className={`flex-1 ${c.align === "right" ? "text-right" : ""}`}>{c.label.toUpperCase()}</div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex px-3 py-1.5 text-[9px] border-t border-violet-50">
          {columns.map((c) => (
            <div key={c.key} className={`flex-1 ${c.align === "right" ? "text-right" : ""}`}>{row[c.key] ?? ""}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PreviewSignatureRow({ signers }: { signers: string[] }) {
  return (
    <div className="flex gap-2 mt-6">
      {signers.map((label, i) => (
        <div key={i} className="flex-1 bg-violet-50/70 border border-violet-100 rounded-lg p-2">
          <div className="border-b border-violet-200 pb-3 mb-1.5 h-6" />
          <div className="text-[7px] text-neutral-500">{label}</div>
        </div>
      ))}
    </div>
  );
}

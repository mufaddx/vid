import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Users, Building2, FileText, ArrowRight } from "lucide-react";

export default async function NewAgreementTypePage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string; brandId?: string; campaignId?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][],
  ).toString();
  const withQs = (path: string) => (qs ? `${path}?${qs}` : path);

  const options = [
    {
      href: withQs("/admin/agreements/new/creator-management"),
      icon: Users,
      title: "Creator / Influencer Management Agreement",
      description: "VIDLIX ↔ Creator. Commission, monthly management fee, additional services.",
    },
    {
      href: withQs("/admin/agreements/new/brand-collaboration"),
      icon: Building2,
      title: "Brand Collaboration Agreement",
      description: "Brand × VIDLIX × Creator. Campaign deliverables, advertising usage, pricing.",
    },
    {
      href: withQs("/admin/agreements/new/custom"),
      icon: FileText,
      title: "Custom / Other",
      description: "NDA, campaign letters and other template-based documents.",
    },
  ];

  return (
    <div>
      <PageHeader title="New Agreement" description="Choose the agreement type to continue" />
      <div className="p-8 max-w-3xl mx-auto grid gap-4">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 hover:border-violet-300 hover:shadow-sm transition-all"
          >
            <div className="size-11 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <opt.icon className="size-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900">{opt.title}</div>
              <div className="text-sm text-neutral-500 mt-0.5">{opt.description}</div>
            </div>
            <ArrowRight className="size-4 text-neutral-300 group-hover:text-violet-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

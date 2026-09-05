import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });

  return (
    <div>
      <PageHeader title="Settings" description="Company profile, letterhead and billing defaults" />
      <div className="p-8 max-w-2xl">
        {/* Prisma's Decimal isn't a plain object — serialize before crossing
            the server/client boundary (spec-agnostic RSC requirement). */}
        <SettingsForm company={{ ...company, defaultCommissionPct: Number(company.defaultCommissionPct) }} />
      </div>
    </div>
  );
}

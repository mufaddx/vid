import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { FooterLinksManager } from "@/components/admin/footer-links-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const [company, footerLinks] = await Promise.all([
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
    prisma.footerLink.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
  ]);

  return (
    <div>
      <PageHeader title="Settings" description="Company profile, letterhead and billing defaults" />
      <div className="p-8">
        <Tabs defaultValue="general" className="max-w-3xl mx-auto">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="footer">Website Footer</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {/* Prisma's Decimal isn't a plain object — serialize before crossing
                the server/client boundary (spec-agnostic RSC requirement). */}
            <SettingsForm company={{ ...company, defaultCommissionPct: Number(company.defaultCommissionPct) }} />
          </TabsContent>

          <TabsContent value="footer">
            <FooterLinksManager links={footerLinks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // `.dark` activates the theme tokens (see globals.css) that every themed
  // component on this site — Button included — reads its colors from.
  // Without it, hover states silently fell back to the light-theme
  // foreground/muted values (near-black text on a dark page), which is
  // exactly why some buttons appeared to vanish on hover.
  const [company, footerLinks, legalPages] = await Promise.all([
    prisma.companySettings.findUnique({ where: { id: "company" } }),
    prisma.footerLink.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
    prisma.legalPage.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="dark flex flex-col min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter
        company={
          company
            ? {
                phone: company.phone,
                email: company.email,
                address: company.address,
                instagramUrl: company.instagramUrl,
                youtubeUrl: company.youtubeUrl,
                facebookUrl: company.facebookUrl,
                xUrl: company.xUrl,
              }
            : null
        }
        footerLinks={footerLinks.map((l) => ({ group: l.group, label: l.label, href: l.href }))}
        legalPages={legalPages}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import type { CompanySettings, FooterLink } from "@prisma/client";

// Forces every page under this layout to be server-rendered per request
// instead of statically prerendered at build time. Root cause of the
// recurring "page loads unstyled, but clicking any link fixes it" bug:
// several routes here (/, /legal, /about, /faq, ...) had no
// Request-time API forcing dynamic rendering, so Next statically
// prerendered them and served that cached HTML on every hit
// (`x-nextjs-cache: HIT`, confirmed via response headers) — with each
// new deploy renaming hashed JS/CSS chunk files, a stale cached snapshot
// referencing a previous deploy's assets could keep being served past
// the deploy that replaced them. Clicking a link "fixed" it because
// client-side navigation re-renders with the currently-loaded (correct)
// JS bundle, bypassing the stale server HTML entirely. Every route that
// was already dynamic (e.g. /blog, /creators) never showed this bug —
// this makes the whole public site behave the same way: a small,
// acceptable per-request DB cost in exchange for this bug being
// structurally impossible from here on.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // `.dark` activates the theme tokens (see globals.css) that every themed
  // component on this site — Button included — reads its colors from.
  // Without it, hover states silently fell back to the light-theme
  // foreground/muted values (near-black text on a dark page), which is
  // exactly why some buttons appeared to vanish on hover.
  //
  // This layout wraps EVERY public route, so an unguarded DB error here
  // used to take the whole site down to Next's bare unstyled fallback (no
  // error.tsx existed to catch it). A transient DB hiccup now degrades to
  // a footer with sensible defaults instead of a broken page.
  let company: CompanySettings | null = null;
  let footerLinks: FooterLink[] = [];
  let legalPages: { slug: string; title: string }[] = [];
  try {
    [company, footerLinks, legalPages] = await Promise.all([
      prisma.companySettings.findUnique({ where: { id: "company" } }),
      prisma.footerLink.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }),
      prisma.legalPage.findMany({ select: { slug: true, title: true }, orderBy: { title: "asc" } }),
    ]);
  } catch (err) {
    console.error("[PublicLayout] failed to load footer/company data", err);
  }

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

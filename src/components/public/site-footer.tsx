import Link from "next/link";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
import { Mail, Phone, MapPin } from "lucide-react";

type FooterLinkItem = { group: "COMPANY" | "PLATFORM" | "GET_STARTED"; label: string; href: string };
type LegalPageItem = { slug: string; title: string };
type CompanyInfo = {
  phone: string;
  email: string;
  address: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
} | null;

const GROUP_LABELS: Record<FooterLinkItem["group"], string> = {
  COMPANY: "Company",
  PLATFORM: "Platform",
  GET_STARTED: "Get Started",
};

// Only rendered for a platform that actually has a URL on file — never a
// placeholder link. See CompanySettings.instagramUrl etc.
const SOCIAL_ICON_DEFS = [
  {
    key: "instagramUrl" as const,
    label: "Instagram",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "youtubeUrl" as const,
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <rect x="1" y="5" width="22" height="14" rx="4" fill="currentColor" />
        <polygon points="10,9 16,12 10,15" fill="var(--background)" />
      </svg>
    ),
  },
  {
    key: "facebookUrl" as const,
    label: "Facebook",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path
          d="M13.8 21v-7.6h2.6l.4-3h-3V8.5c0-.87.24-1.46 1.49-1.46h1.6V4.35c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.87 1.4-3.87 3.98v2.19H8.7v3h2.1V21h3z"
          fill="var(--background)"
        />
      </svg>
    ),
  },
  {
    key: "xUrl" as const,
    label: "X",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path d="M7 7l10 10M17 7L7 17" stroke="var(--background)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

// A representative subset in the footer, not all ten legal documents —
// the rest live at /legal.
const FEATURED_LEGAL_SLUGS = ["terms", "privacy", "cookie-policy"];

export function SiteFooter({
  company,
  footerLinks,
  legalPages,
}: {
  company: CompanyInfo;
  footerLinks: FooterLinkItem[];
  legalPages: LegalPageItem[];
}) {
  const contact = {
    phone: company?.phone || "+91 74887 16130",
    email: company?.email || "hello@vidlix.in",
    address: company?.address || "Delhi, India",
  };

  const socialLinks = SOCIAL_ICON_DEFS.filter((s) => company?.[s.key]).map((s) => ({ ...s, href: company![s.key]! }));

  const groups: { heading: string; links: { href: string; label: string }[] }[] = (
    ["COMPANY", "PLATFORM", "GET_STARTED"] as const
  ).map((g) => ({
    heading: GROUP_LABELS[g],
    links: footerLinks.filter((l) => l.group === g),
  }));

  const featuredLegal = FEATURED_LEGAL_SLUGS.map((slug) => legalPages.find((p) => p.slug === slug)).filter(
    (p): p is LegalPageItem => !!p,
  );
  groups.push({
    heading: "Legal",
    links: [...featuredLegal.map((p) => ({ href: `/legal/${p.slug}`, label: p.title })), { href: "/legal", label: "All Policies" }],
  });

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[36rem] max-w-[150vw] rounded-full bg-violet-600/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-14 sm:py-16">
        <div className="mb-10">
          <VidlixWordmark className="text-lg font-bold tracking-widest text-white" xClassName="text-violet-400" />
          <p className="text-sm text-neutral-400 mt-4 max-w-sm leading-relaxed">
            Creators, brands &amp; beyond. VIDLIX manages exceptional creators
            and connects them with ambitious brands.
          </p>
          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-2 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex items-center justify-center size-9 rounded-full border border-white/10 bg-white/[0.03] text-neutral-400 transition-all hover:text-violet-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:-translate-y-0.5"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
          {groups.map((group) => (
            <div key={group.heading} className="min-w-0">
              <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-4">
                {group.heading.toUpperCase()}
              </div>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-neutral-400 transition-colors hover:text-white break-words">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-4">CONTACT</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-neutral-400">
            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="flex items-start gap-2.5 min-w-0 transition-colors hover:text-white">
              <Phone className="size-4 mt-0.5 shrink-0 text-violet-400" />
              <span className="break-words">{contact.phone}</span>
            </a>
            <a href={`mailto:${contact.email}`} className="flex items-start gap-2.5 min-w-0 transition-colors hover:text-white">
              <Mail className="size-4 mt-0.5 shrink-0 text-violet-400" />
              <span className="break-words">{contact.email}</span>
            </a>
            <span className="flex items-start gap-2.5 min-w-0">
              <MapPin className="size-4 mt-0.5 shrink-0 text-violet-400" />
              <span className="break-words">{contact.address}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600 text-center sm:text-left">
          <span>© {new Date().getFullYear()} VIDLIX. All rights reserved.</span>
          <span className="text-neutral-700">Creators • Brands • Beyond</span>
        </div>
      </div>
    </footer>
  );
}

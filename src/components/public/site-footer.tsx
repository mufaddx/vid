import Link from "next/link";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
import { Mail, Phone, MapPin } from "lucide-react";

// Same four platforms as the PDF letterhead footer (src/lib/pdf/social-icons.tsx)
// — VIDLIX doesn't have distinct public profile URLs on file for its own
// brand accounts yet, so every icon points at vidlix.in, matching the
// letterhead's existing treatment rather than inventing profile links.
const SOCIAL_LINKS = [
  {
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
    label: "YouTube",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <rect x="1" y="5" width="22" height="14" rx="4" fill="currentColor" />
        <polygon points="10,9 16,12 10,15" fill="var(--background)" />
      </svg>
    ),
  },
  {
    label: "X",
    svg: (
      <svg viewBox="0 0 24 24" className="size-4">
        <circle cx="12" cy="12" r="12" fill="currentColor" />
        <path d="M7 7l10 10M17 7L7 17" stroke="var(--background)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

const LINK_GROUPS = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { href: "/creators", label: "Creators" },
      { href: "/for-brands", label: "For Brands" },
      { href: "/for-creators", label: "For Creators" },
    ],
  },
  {
    heading: "Get Started",
    links: [
      { href: "/brand-inquiry", label: "Brand Inquiry" },
      { href: "/creator-inquiry", label: "Creator Inquiry" },
    ],
  },
];

export function SiteFooter({
  company,
}: {
  company: { phone: string; email: string; address: string } | null;
}) {
  const contact = {
    phone: company?.phone || "+91 74887 16130",
    email: company?.email || "hello@vidlix.in",
    address: company?.address || "Delhi, India",
  };

  return (
    <footer className="relative border-t border-white/10 bg-neutral-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[36rem] rounded-full bg-violet-600/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]">
        <div>
          <VidlixWordmark className="text-lg font-bold tracking-widest text-white" xClassName="text-violet-400" />
          <p className="text-sm text-neutral-400 mt-4 max-w-xs leading-relaxed">
            Creators, brands &amp; beyond. VIDLIX manages exceptional creators
            and connects them with ambitious brands.
          </p>
          <div className="flex items-center gap-2 mt-6">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href="https://vidlix.in"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex items-center justify-center size-9 rounded-full border border-white/10 bg-white/[0.03] text-neutral-400 transition-all hover:text-violet-300 hover:border-violet-400/40 hover:bg-violet-500/10 hover:-translate-y-0.5"
              >
                {s.svg}
              </a>
            ))}
          </div>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.heading}>
            <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-4">
              {group.heading.toUpperCase()}
            </div>
            <ul className="space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-400 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-4">CONTACT</div>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="flex items-start gap-2.5 transition-colors hover:text-white">
                <Phone className="size-4 mt-0.5 shrink-0 text-violet-400" />
                <span>{contact.phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-start gap-2.5 transition-colors hover:text-white">
                <Mail className="size-4 mt-0.5 shrink-0 text-violet-400" />
                <span>{contact.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="size-4 mt-0.5 shrink-0 text-violet-400" />
              <span>{contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>© {new Date().getFullYear()} VIDLIX. All rights reserved.</span>
          <span className="text-neutral-700">Creators • Brands • Beyond</span>
        </div>
      </div>
    </footer>
  );
}

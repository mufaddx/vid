import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CreatorOrbit } from "@/components/public/creator-orbit";
import { CreatorCard } from "@/components/public/creator-card";
import { HeroParticles } from "@/components/public/hero-particles";
import { Marquee } from "@/components/public/marquee";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber } from "@/lib/format";
import { ArrowRight, Handshake, ShieldCheck, TrendingUp, Users2 } from "lucide-react";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.3em] text-violet-400">
      {children}
    </div>
  );
}

function fetchCreators() {
  return prisma.creator.findMany({
    where: { status: "ACTIVE" },
    include: { socialAccounts: { include: { metric: true } } },
    orderBy: [{ featured: "desc" }, { orbitPriority: "asc" }],
    take: 8,
  });
}

export default async function HomePage() {
  // A transient DB error here used to throw uncaught, and with no
  // error.tsx in place, Next fell back to its bare unstyled default page.
  // Degrade to an empty-creators homepage instead — everything below
  // already handles `cardData.length === 0` gracefully.
  let creators: Awaited<ReturnType<typeof fetchCreators>> = [];
  let networkAudience = 0;
  try {
    creators = await fetchCreators();
    const allMetrics = await prisma.socialMetric.findMany({ include: { socialAccount: true } });
    networkAudience = allMetrics.reduce(
      (s, m) => s + (m.socialAccount.platform === "YOUTUBE" ? m.subscribers : m.followers),
      0,
    );
  } catch (err) {
    console.error("[HomePage] failed to load creators/metrics", err);
  }

  const cardData = creators.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    city: c.city,
    profileImage: c.profileImage,
    cardImage: c.cardImage,
    totalAudience: computeTotalAudience(c.socialAccounts),
  }));

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.16),transparent)]" />
        <HeroParticles className="absolute inset-0 h-full w-full opacity-70" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28 text-center">
          <Eyebrow>CREATORS • BRANDS • BEYOND</Eyebrow>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05] mt-6 text-balance">
            THE PEOPLE BEHIND{" "}
            <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
              INFLUENCE.
            </span>
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto mt-6 text-base sm:text-lg leading-relaxed">
            VIDLIX manages exceptional creators, connects them with ambitious brands,
            and handles everything from collaboration to contracts and payments.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <Button
              asChild
              size="lg"
              className="h-11 px-6 bg-violet-600 text-white shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_8px_24px_-8px_rgba(124,58,237,0.6)] hover:bg-violet-500 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.6),0_10px_30px_-6px_rgba(124,58,237,0.75)] transition-all"
            >
              <Link href="/creators">Explore Creators <ArrowRight className="size-4" /></Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 px-6 border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white transition-all"
            >
              <Link href="/creator-inquiry">Join VIDLIX</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 px-6 text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <Link href="/brand-inquiry">Work With Our Creators</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Creator Orbit */}
      {cardData.length > 0 ? (
        <section className="max-w-5xl mx-auto px-6 py-20 sm:py-24">
          <CreatorOrbit creators={cardData.map((c) => ({ slug: c.slug, name: c.name, profileImage: c.profileImage }))} />
        </section>
      ) : null}

      {/* Trust */}
      <section className="border-y border-white/10 bg-white/[0.02] py-6">
        <Marquee
          items={[
            "TRUSTED BY AMBITIOUS BRANDS",
            `${formatCompactNumber(networkAudience)}+ COMBINED AUDIENCE`,
            `${creators.length}+ MANAGED CREATORS`,
            "VERIFIED AUDIENCE DATA",
            "MANAGED, NOT DIY",
            "BRAND-GRADE AGREEMENTS",
          ]}
        />
      </section>

      {/* Featured Creators */}
      {cardData.length > 0 ? (
        <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Eyebrow>FEATURED</Eyebrow>
              <h2 className="text-2xl sm:text-3xl font-bold mt-3">Featured Creators</h2>
            </div>
            <Link href="/creators" className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 shrink-0">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {cardData.map((c) => (
              <CreatorCard key={c.slug} creator={c} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Why VIDLIX */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <Eyebrow>WHY VIDLIX</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-bold mt-3">A management team, not a marketplace</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Managed, Not DIY", body: "Our team handles negotiation, contracts and payments so creators can focus on content." },
            { icon: TrendingUp, title: "Verified Audience Data", body: "Real, synced social metrics — never inflated, always current." },
            { icon: Handshake, title: "Brand-Grade Process", body: "Agreements, invoicing and payouts run through one professional pipeline." },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-violet-400/30 hover:bg-white/[0.04] hover:-translate-y-0.5"
            >
              <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mb-5 transition-colors group-hover:bg-violet-500/15">
                <item.icon className="size-5 text-violet-400" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Brands / For Creators */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-violet-950/40 to-transparent transition-all hover:border-violet-400/25">
          <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mb-5">
            <Users2 className="size-5 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">For Brands</h3>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Discover VIDLIX-managed creators with verified audiences and run
            campaigns end-to-end — briefing, agreements, delivery, payment —
            through a single point of contact.
          </p>
          <Button asChild variant="ghost" className="border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white transition-all">
            <Link href="/brand-inquiry">Start a Brand Inquiry</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-neutral-900 to-transparent transition-all hover:border-violet-400/25">
          <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mb-5">
            <Handshake className="size-5 text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">For Creators</h3>
          <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
            Let VIDLIX manage your brand relationships, contracts, invoicing
            and payouts — so you can focus entirely on your content.
          </p>
          <Button asChild variant="ghost" className="border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white transition-all">
            <Link href="/creator-inquiry">Apply to Join</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <Eyebrow>PROCESS</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-bold mt-3">How It Works</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Discover", body: "Brands browse VIDLIX-managed creators by niche, platform and audience." },
            { step: "02", title: "Connect", body: "Submit a collaboration inquiry — VIDLIX handles the rest." },
            { step: "03", title: "Agree", body: "Digital agreements, e-signed securely by every party." },
            { step: "04", title: "Deliver & Pay", body: "Content goes live, invoices are settled, creators are paid." },
          ].map((s) => (
            <div key={s.step} className="relative pl-0">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-400/70 to-violet-700/40 mb-2">
                {s.step}
              </div>
              <h4 className="font-semibold mb-1.5">{s.title}</h4>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 via-neutral-900 to-neutral-950 px-6 py-16 sm:py-20 text-center">
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Ready to work with VIDLIX?</h2>
            <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
              Whether you&rsquo;re a brand or a creator, VIDLIX makes collaboration effortless.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-6 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
                <Link href="/brand-inquiry">Start a Campaign</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-11 px-6 border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white transition-all">
                <Link href="/creator-inquiry">Join as a Creator</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

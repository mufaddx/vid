import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CreatorOrbit } from "@/components/public/creator-orbit";
import { CreatorCard } from "@/components/public/creator-card";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber } from "@/lib/format";
import { ArrowRight, Handshake, ShieldCheck, TrendingUp, Users2 } from "lucide-react";

export default async function HomePage() {
  const creators = await prisma.creator.findMany({
    where: { status: "ACTIVE" },
    include: { socialAccounts: { include: { metric: true } } },
    orderBy: [{ featured: "desc" }, { orbitPriority: "asc" }],
    take: 8,
  });

  const allMetrics = await prisma.socialMetric.findMany({ include: { socialAccount: true } });
  const networkAudience = allMetrics.reduce(
    (s, m) => s + (m.socialAccount.platform === "YOUTUBE" ? m.subscribers : m.followers),
    0,
  );

  const cardData = creators.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    city: c.city,
    profileImage: c.profileImage,
    totalAudience: computeTotalAudience(c.socialAccounts),
  }));

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block text-[11px] tracking-[0.3em] text-violet-400 mb-6">
          CREATORS • BRANDS • BEYOND
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.05]">
          THE PEOPLE BEHIND INFLUENCE.
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto mt-6 text-base sm:text-lg">
          VIDLIX manages exceptional creators, connects them with ambitious brands,
          and handles everything from collaboration to contracts and payments.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
            <Link href="/creators">Explore Creators <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">
            <Link href="/creator-inquiry">Join VIDLIX</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="text-neutral-300 hover:text-white hover:bg-white/10">
            <Link href="/brand-inquiry">Work With Our Creators</Link>
          </Button>
        </div>
      </section>

      {/* Creator Orbit */}
      {cardData.length > 0 ? (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <CreatorOrbit creators={cardData.map((c) => ({ slug: c.slug, name: c.name, profileImage: c.profileImage }))} />
        </section>
      ) : null}

      {/* Trust */}
      <section className="border-y border-white/10 bg-white/[0.02] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-neutral-500 text-sm tracking-widest">
          <span>TRUSTED BY AMBITIOUS BRANDS</span>
          <span>·</span>
          <span>{formatCompactNumber(networkAudience)}+ COMBINED AUDIENCE</span>
          <span>·</span>
          <span>{creators.length}+ MANAGED CREATORS</span>
        </div>
      </section>

      {/* Featured Creators */}
      {cardData.length > 0 ? (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Creators</h2>
            <Link href="/creators" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
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
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: "Managed, Not DIY", body: "Our team handles negotiation, contracts and payments so creators can focus on content." },
          { icon: TrendingUp, title: "Verified Audience Data", body: "Real, synced social metrics — never inflated, always current." },
          { icon: Handshake, title: "Brand-Grade Process", body: "Agreements, invoicing and payouts run through one professional pipeline." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 p-6">
            <item.icon className="size-6 text-violet-400 mb-4" />
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-400">{item.body}</p>
          </div>
        ))}
      </section>

      {/* For Brands / For Creators */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-violet-950/40 to-transparent">
          <Users2 className="size-6 text-violet-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">For Brands</h3>
          <p className="text-sm text-neutral-400 mb-6">
            Discover VIDLIX-managed creators with verified audiences and run
            campaigns end-to-end — briefing, agreements, delivery, payment —
            through a single point of contact.
          </p>
          <Button asChild variant="ghost" className="border border-white/20 text-white hover:bg-white/10">
            <Link href="/brand-inquiry">Start a Brand Inquiry</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-white/10 p-8 bg-gradient-to-br from-neutral-900 to-transparent">
          <Handshake className="size-6 text-violet-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">For Creators</h3>
          <p className="text-sm text-neutral-400 mb-6">
            Let VIDLIX manage your brand relationships, contracts, invoicing
            and payouts — so you can focus entirely on your content.
          </p>
          <Button asChild variant="ghost" className="border border-white/20 text-white hover:bg-white/10">
            <Link href="/creator-inquiry">Apply to Join</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Discover", body: "Brands browse VIDLIX-managed creators by niche, platform and audience." },
            { step: "02", title: "Connect", body: "Submit a collaboration inquiry — VIDLIX handles the rest." },
            { step: "03", title: "Agree", body: "Digital agreements, e-signed securely by every party." },
            { step: "04", title: "Deliver & Pay", body: "Content goes live, invoices are settled, creators are paid." },
          ].map((s) => (
            <div key={s.step}>
              <div className="text-3xl font-bold text-violet-500/60 mb-2">{s.step}</div>
              <h4 className="font-semibold mb-1">{s.title}</h4>
              <p className="text-sm text-neutral-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to work with VIDLIX?</h2>
        <p className="text-neutral-400 mb-8">Whether you're a brand or a creator, VIDLIX makes collaboration effortless.</p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
            <Link href="/brand-inquiry">Start a Campaign</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">
            <Link href="/creator-inquiry">Join as a Creator</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

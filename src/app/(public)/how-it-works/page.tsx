import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, MessageSquare, FileSignature, Wallet } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | VIDLIX",
  description: "How VIDLIX runs a creator-brand collaboration from first conversation to final payout.",
};

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Discover",
    body: "Brands browse VIDLIX-managed creators by niche, platform and audience, or come to us with a brief and let our team recommend the right fit. Every creator's audience data is synced from their real, connected accounts — not self-reported.",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "Connect",
    body: "Submit a collaboration inquiry and VIDLIX takes it from there — clarifying the brief, deliverables and budget, and matching it against the right creator's availability and terms.",
  },
  {
    icon: FileSignature,
    step: "03",
    title: "Agree",
    body: "A structured, one-page Brand Collaboration Agreement is prepared — covering exact deliverables, any paid-advertising usage rights, and pricing — and e-signed securely by the brand, the creator, and VIDLIX. Nothing goes live until every party has signed.",
  },
  {
    icon: Wallet,
    step: "04",
    title: "Deliver & Pay",
    body: "Content goes live per the agreed deliverables. VIDLIX issues the invoice, tracks payment, and processes the creator's payout according to the commission and terms already set out in the signed agreement — all auditable, start to finish.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="text-white">
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-4 text-center">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">THE PROCESS</div>
        <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-6 text-balance">How VIDLIX works.</h1>
        <p className="text-neutral-300 leading-relaxed text-base sm:text-lg">
          One professional process runs every collaboration, from the first conversation to the final payout —
          for both brands and the creators VIDLIX represents.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 gap-6">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-all hover:border-violet-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center shrink-0">
                  <s.icon className="size-5 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-400/70 to-violet-700/40">
                  {s.step}
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 sm:pb-24">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/40 to-transparent p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start?</h2>
          <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
            Whether you&rsquo;re a brand planning a campaign or a creator looking to be managed properly, the first step is the same.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
              <Link href="/brand-inquiry">Start a Campaign <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-11 px-6 border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white transition-all">
              <Link href="/creator-inquiry">Apply as a Creator</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Brands | VIDLIX",
  description: "Run creator campaigns end-to-end with a single point of contact and verified audience data.",
};

export default function ForBrandsPage() {
  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">FOR BRANDS</div>
      <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-6 text-balance">Run creator campaigns, minus the chasing.</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        VIDLIX gives brands a single, professional point of contact for
        working with a curated network of managed creators. From discovery
        through contracting, content delivery and payment, our team runs the
        entire collaboration so your team doesn&rsquo;t have to chase individual
        creators.
      </p>
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 mt-8 mb-10">
        <ShieldCheck className="size-5 text-violet-400 mt-0.5 shrink-0" />
        <p className="text-sm text-neutral-400 leading-relaxed">
          Every VIDLIX-managed creator comes with verified, regularly-synced
          audience data — no inflated numbers, no guesswork.
        </p>
      </div>
      <Button asChild size="lg" className="h-11 px-6 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
        <Link href="/brand-inquiry">Start a Brand Inquiry <ArrowRight className="size-4" /></Link>
      </Button>
    </div>
  );
}

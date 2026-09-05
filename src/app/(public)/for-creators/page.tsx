import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ForCreatorsPage() {
  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">FOR CREATORS</div>
      <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-6 text-balance">Focus on content. We&rsquo;ll handle the rest.</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        VIDLIX manages the business side of your creator career — brand
        outreach, negotiation, contracts, invoicing and payouts — so you can
        focus entirely on your content.
      </p>
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 mt-8 mb-10">
        <Sparkles className="size-5 text-violet-400 mt-0.5 shrink-0" />
        <p className="text-sm text-neutral-400 leading-relaxed">
          There&rsquo;s no dashboard to manage or invoices to chase. Every agreement
          is e-signed securely, and every payout is tracked transparently.
        </p>
      </div>
      <Button asChild size="lg" className="h-11 px-6 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
        <Link href="/creator-inquiry">Apply to Join VIDLIX <ArrowRight className="size-4" /></Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForCreatorsPage() {
  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">For Creators</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        VIDLIX manages the business side of your creator career — brand
        outreach, negotiation, contracts, invoicing and payouts — so you can
        focus entirely on your content.
      </p>
      <p className="text-neutral-400 leading-relaxed mb-10">
        There's no dashboard to manage or invoices to chase. Every agreement
        is e-signed securely, and every payout is tracked transparently.
      </p>
      <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
        <Link href="/creator-inquiry">Apply to Join VIDLIX</Link>
      </Button>
    </div>
  );
}

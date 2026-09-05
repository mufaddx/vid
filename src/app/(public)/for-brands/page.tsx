import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForBrandsPage() {
  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">For Brands</h1>
      <p className="text-neutral-300 leading-relaxed mb-4">
        VIDLIX gives brands a single, professional point of contact for
        working with a curated network of managed creators. From discovery
        through contracting, content delivery and payment, our team runs the
        entire collaboration so your team doesn't have to chase individual
        creators.
      </p>
      <p className="text-neutral-400 leading-relaxed mb-10">
        Every VIDLIX-managed creator comes with verified, regularly-synced
        audience data — no inflated numbers, no guesswork.
      </p>
      <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700">
        <Link href="/brand-inquiry">Start a Brand Inquiry</Link>
      </Button>
    </div>
  );
}

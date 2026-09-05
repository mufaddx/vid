import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function BrandInquiryReceivedPage() {
  return (
    <div className="text-white max-w-lg mx-auto px-6 py-24 text-center">
      <CheckCircle2 className="size-14 text-emerald-500 mx-auto mb-6" />
      <h1 className="text-2xl font-bold mb-3">Thank you.</h1>
      <p className="text-neutral-400 mb-8">
        Your inquiry has been received by VIDLIX. Our team will review your
        information and contact you shortly.
      </p>
      <Button asChild variant="ghost" className="border border-white/20 text-white hover:text-white hover:bg-white/10 transition-colors">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}

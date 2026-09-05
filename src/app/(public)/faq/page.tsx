import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | VIDLIX",
  description: "Answers to common questions about working with VIDLIX as a brand or a creator.",
};

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What exactly does VIDLIX do?",
    answer:
      "VIDLIX is a creator and influencer management company. We represent a curated roster of creators, connect them with brands, and run every collaboration end-to-end — negotiation, e-signed agreements, invoicing and payouts — through one professional process.",
  },
  {
    question: "Is VIDLIX a marketplace where anyone can list themselves?",
    answer:
      "No. VIDLIX is not a self-service marketplace or listing platform. We work directly and personally with a managed roster of creators, and every collaboration is run by our team rather than left to the two parties to sort out on their own.",
  },
  {
    question: "How do I apply to be managed by VIDLIX as a creator?",
    answer:
      "Submit a Creator Inquiry from our Creator Inquiry page with your details, social accounts and a short note on why you'd like VIDLIX to manage you. Our team personally reviews every application and will follow up if it's a good fit.",
  },
  {
    question: "How does VIDLIX get paid — what's the commission?",
    answer:
      "VIDLIX earns a commission on brand deals it secures for a managed creator, agreed up front in that creator's Creator Management Agreement. Some creators also have a monthly management fee, which can be waived (FREE) depending on the arrangement. Every figure is stated clearly in the signed agreement — nothing is hidden in fine print.",
  },
  {
    question: "How do brands start a campaign with VIDLIX?",
    answer:
      "Submit a Brand Inquiry describing your brand, campaign and budget. Our team reviews it and reaches out to discuss creator matches, deliverables and next steps.",
  },
  {
    question: "How is the audience data on creator profiles verified?",
    answer:
      "Audience numbers shown for VIDLIX-managed creators are synced directly from their connected social accounts, not self-reported. We believe brands should be able to trust the numbers they're planning a campaign around.",
  },
  {
    question: "How are agreements signed?",
    answer:
      "Every VIDLIX agreement — Creator Management or Brand Collaboration — is a structured, one-page document that every relevant party (creator, brand, and VIDLIX) reviews and e-signs securely, with an audit trail of who signed what and when.",
  },
  {
    question: "What happens if a brand wants to run creator content as paid advertising?",
    answer:
      "Paid-advertising usage (boosting a creator's content as an ad on Meta, Google or YouTube) is a separate right from an organic post, and it's tracked explicitly in the Brand Collaboration Agreement — including which platform, for how long, and at what fee.",
  },
  {
    question: "How and when do creators get paid?",
    answer:
      "Payouts follow the commission and payment terms set out in the creator's agreement, and are tracked through invoices and payout statements administered by VIDLIX — so there's a clear, auditable record of every payment.",
  },
  {
    question: "Can a Creator Management Agreement be ended?",
    answer:
      "Yes. A Creator Management Agreement stays in effect until it's ended in writing through a separate Cancellation Agreement — there's no fixed expiry date that lapses automatically.",
  },
  {
    question: "Does VIDLIX guarantee campaign results?",
    answer:
      "We don't make blanket guarantees about outcomes like sales or reach beyond what's expressly agreed in a signed Brand Collaboration Agreement — see our Disclaimer for details. What we do guarantee is a professional process: verified data, clear contracts, and transparent payment.",
  },
];

export default function FaqPage() {
  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">FAQ</div>
        <h1 className="text-3xl sm:text-5xl font-bold mt-4 text-balance">Frequently Asked Questions</h1>
        <p className="text-neutral-400 mt-3 max-w-xl mx-auto">
          Common questions from brands and creators. Can&rsquo;t find what you need?{" "}
          <a href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">Contact us</a>.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {FAQS.map((item) => (
          <details key={item.question} className="group px-6 py-5">
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-medium text-white">
              {item.question}
              <span className="shrink-0 text-violet-400 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <p className="text-sm text-neutral-400 leading-relaxed mt-3">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

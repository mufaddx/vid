import { prisma } from "@/lib/prisma";
import { submitBrandInquiryAction } from "@/server/actions/inquiries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function BrandInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ creatorId?: string }>;
}) {
  const { creatorId } = await searchParams;
  const selectedCreator = creatorId
    ? await prisma.creator.findUnique({ where: { id: creatorId } })
    : null;

  return (
    <div className="text-white max-w-2xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-10">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">BRAND INQUIRY</div>
        <h1 className="text-3xl sm:text-4xl font-bold mt-4">Start a Campaign</h1>
        <p className="text-neutral-400 mt-3">
          Tell us about your brand and campaign — VIDLIX will connect you with the right creators.
        </p>
      </div>

      {selectedCreator ? (
        <div className="mb-8 rounded-xl border border-violet-500/30 bg-violet-500/[0.06] px-4 py-3 text-sm text-violet-200">
          You&rsquo;re inquiring about a collaboration with <strong>{selectedCreator.name}</strong>.
        </div>
      ) : null}

      <form action={submitBrandInquiryAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <input type="hidden" name="creatorId" value={selectedCreator?.id ?? ""} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Brand Name *" name="brandName" required />
          <Field label="Contact Person *" name="contactPerson" required />
          <Field label="Business Email *" name="email" type="email" required />
          <Field label="Mobile Number *" name="phone" required />
          <Field label="Website" name="website" />
          <Field label="Campaign Name *" name="campaignName" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Campaign Description *</Label>
          <Textarea name="campaignDescription" required rows={4} className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Campaign Type" name="campaignType" />
          <Field label="Budget (₹)" name="budget" type="number" />
          <Field label="Start Date" name="startDate" type="date" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="End Date" name="endDate" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Additional Requirements</Label>
          <Textarea name="additionalRequirements" rows={3} className="bg-white/5 border-white/10 text-white" />
        </div>
        <Button type="submit" size="lg" className="w-full h-11 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
          Submit Collaboration Request
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-neutral-300">{label}</Label>
      <Input id={name} name={name} type={type} required={required} className="bg-white/5 border-white/10 text-white" />
    </div>
  );
}

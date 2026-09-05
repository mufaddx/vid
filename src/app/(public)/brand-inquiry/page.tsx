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
    <div className="text-white max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Start a Campaign</h1>
        <p className="text-neutral-400 mt-3">
          Tell us about your brand and campaign — VIDLIX will connect you with the right creators.
        </p>
      </div>

      {selectedCreator ? (
        <div className="mb-8 rounded-xl border border-violet-500/30 bg-violet-500/[0.06] px-4 py-3 text-sm text-violet-200">
          You're inquiring about a collaboration with <strong>{selectedCreator.name}</strong>.
        </div>
      ) : null}

      <form action={submitBrandInquiryAction} className="space-y-5">
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
        <Button type="submit" size="lg" className="w-full bg-violet-600 hover:bg-violet-700">
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

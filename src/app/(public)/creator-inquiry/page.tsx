import { submitCreatorInquiryAction } from "@/server/actions/inquiries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreatorInquiryPage() {
  return (
    <div className="text-white max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">JOIN VIDLIX</h1>
        <p className="text-neutral-400 mt-3">
          Tell us about yourself — our team reviews every application personally.
        </p>
      </div>

      <form action={submitCreatorInquiryAction} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full Name *" name="fullName" required />
          <Field label="Email *" name="email" type="email" required />
          <Field label="Mobile *" name="phone" required />
          <Field label="Location" name="location" />
          <Field label="Instagram" name="instagram" />
          <Field label="YouTube" name="youtube" />
          <Field label="Facebook" name="facebook" />
          <Field label="Category" name="category" />
          <Field label="Current Audience" name="currentAudience" />
          <Field label="Portfolio Link" name="portfolio" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Bio</Label>
          <Textarea name="bio" rows={3} className="bg-white/5 border-white/10 text-white" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-neutral-300">Why do you want VIDLIX to manage you?</Label>
          <Textarea name="reason" rows={3} className="bg-white/5 border-white/10 text-white" />
        </div>
        <Button type="submit" size="lg" className="w-full bg-violet-600 hover:bg-violet-700">
          Submit Application
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

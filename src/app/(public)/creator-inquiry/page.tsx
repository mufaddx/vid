import { submitCreatorInquiryAction } from "@/server/actions/inquiries";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreatorInquiryPage() {
  return (
    <div className="text-white max-w-2xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-10">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">CREATOR APPLICATION</div>
        <h1 className="text-3xl sm:text-4xl font-bold mt-4">Join VIDLIX</h1>
        <p className="text-neutral-400 mt-3">
          Tell us about yourself — our team reviews every application personally.
        </p>
      </div>

      <form action={submitCreatorInquiryAction} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
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
        <Button type="submit" size="lg" className="w-full h-11 bg-violet-600 text-white hover:bg-violet-500 shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-all">
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

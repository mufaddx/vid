import { PageHeader } from "@/components/admin/page-header";
import { createBrandAction } from "@/server/actions/brands";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewBrandPage() {
  return (
    <div>
      <PageHeader title="Add Brand" description="Register a new brand relationship" />
      <form action={createBrandAction} className="p-8 max-w-xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" name="contactPerson" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
        <Button type="submit">Add Brand</Button>
      </form>
    </div>
  );
}

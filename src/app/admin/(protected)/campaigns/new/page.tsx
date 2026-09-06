import { redirect } from "next/navigation";

// Campaign creation now happens via the "New Campaign" popup on the
// Campaigns list / Brand detail pages (see AddCampaignDialog) instead of
// a dedicated full-page form.
export default function NewCampaignPage() {
  redirect("/admin/campaigns");
}

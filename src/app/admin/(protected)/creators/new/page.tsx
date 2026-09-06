import { redirect } from "next/navigation";

// Creator creation now happens via the "Add Creator" popup on the list
// page (see AddCreatorDialog) instead of a dedicated full-page form.
export default function NewCreatorPage() {
  redirect("/admin/creators");
}

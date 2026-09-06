import { redirect } from "next/navigation";

// Brand creation now happens via the "Add Brand" popup on the list page
// (see AddBrandDialog) instead of a dedicated full-page form.
export default function NewBrandPage() {
  redirect("/admin/brands");
}

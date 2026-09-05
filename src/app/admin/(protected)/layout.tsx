import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar admin={session} />
      {/* Capped width so the page doesn't stretch edge-to-edge into a bare
          strip on wide monitors — PageHeader and each page's own content
          div both sit inside this, so they stay visually aligned. */}
      <main className="flex-1 min-w-0 max-w-[1400px] mx-auto">{children}</main>
      <Toaster />
    </div>
  );
}

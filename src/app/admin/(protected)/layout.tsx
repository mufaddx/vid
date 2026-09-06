import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { TopHeader } from "@/components/admin/top-header";
import { Toaster } from "@/components/ui/sonner";
import { hasPermission, moduleForPath } from "@/lib/permissions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // Role-based access control: a module the current pathname belongs to
  // that the admin's role can't reach redirects to the dashboard, which
  // every role can always reach (see src/lib/permissions.ts). Enforced
  // here — once, for every protected route — rather than per-page.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const module = moduleForPath(pathname);
  if (module && !hasPermission(session.role, module)) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar admin={session} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader />
        {/* Capped width so the page doesn't stretch edge-to-edge into a bare
            strip on wide monitors — PageHeader and each page's own content
            div both sit inside this, so they stay visually aligned. */}
        <main className="flex-1 min-w-0 w-full max-w-[1400px] mx-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}

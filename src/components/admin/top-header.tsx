import { logoutAction } from "@/server/actions/auth";
import { LogOut } from "lucide-react";

// A slim top bar spanning the content area, sibling to AdminSidebar in the
// protected layout — holds the panel branding and Logout, so Logout is
// reachable from the top of every admin page instead of scrolled down at
// the bottom of the sidebar.
export function TopHeader() {
  return (
    <div className="h-12 shrink-0 sticky top-0 z-30 flex items-center justify-between px-6 border-b border-neutral-200 bg-white">
      <span className="text-sm font-semibold text-neutral-700 tracking-wide">VIDLIX Admin Panel</span>
      <form action={logoutAction}>
        <button className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-red-600 transition-colors">
          <LogOut className="size-3.5" /> Logout
        </button>
      </form>
    </div>
  );
}

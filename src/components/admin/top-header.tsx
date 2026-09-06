// A slim top bar spanning the content area, sibling to AdminSidebar in the
// protected layout — branding only. Logout lives in the sidebar (see
// AdminSidebar) so the top header stays clean and focused on the current
// page/panel.
export function TopHeader() {
  return (
    <div className="h-12 shrink-0 sticky top-0 z-30 flex items-center px-6 border-b border-neutral-200 bg-white">
      <span className="text-sm font-semibold text-neutral-700 tracking-wide">VIDLIX Admin Panel</span>
    </div>
  );
}

// Route segment config must come from a Server Component to reliably take
// effect — src/app/admin/login/page.tsx is "use client" (it holds the
// login/OTP form state), so the export there alone wasn't actually forcing
// dynamic rendering (confirmed via a local production build still showing
// it as "○ Static"). See (public)/layout.tsx for the full explanation of
// the bug this fixes.
export const dynamic = "force-dynamic";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

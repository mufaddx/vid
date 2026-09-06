"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  Handshake,
  FileSignature,
  Wallet,
  Inbox,
  MailPlus,
  Contact,
  FolderOpen,
  BarChart3,
  Bell,
  Settings,
  Newspaper,
  Scale,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
import type { SessionAdmin } from "@/lib/auth";
import { hasPermission, type Module } from "@/lib/permissions";

const NAV: { href: string; label: string; icon: typeof LayoutDashboard; module: Module }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/admin/creators", label: "Creators", icon: Users, module: "creators" },
  { href: "/admin/brands", label: "Brands", icon: Building2, module: "brands" },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone, module: "campaigns" },
  { href: "/admin/collaborations", label: "Collaborations", icon: Handshake, module: "collaborations" },
  { href: "/admin/agreements", label: "Agreements", icon: FileSignature, module: "agreements" },
  { href: "/admin/billing", label: "Billing", icon: Wallet, module: "billing" },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, module: "inbox" },
  { href: "/admin/email-accounts", label: "Email Accounts", icon: MailPlus, module: "email-accounts" },
  { href: "/admin/inquiries", label: "Inquiries", icon: Contact, module: "inquiries" },
  { href: "/admin/documents", label: "Documents", icon: FolderOpen, module: "documents" },
  { href: "/admin/blog", label: "Blog", icon: Newspaper, module: "blog" },
  { href: "/admin/legal", label: "Legal Pages", icon: Scale, module: "legal" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, module: "reports" },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, module: "notifications" },
  { href: "/admin/employees", label: "Employees", icon: UserCog, module: "employees" },
  { href: "/admin/settings", label: "Settings", icon: Settings, module: "settings" },
];

export function AdminSidebar({
  admin,
  badges,
}: {
  admin: SessionAdmin;
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();
  const visibleNav = NAV.filter((item) => hasPermission(admin.role, item.module));

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-neutral-950 border-r border-neutral-800 text-neutral-300">
      <div className="px-5 py-6">
        <VidlixWordmark className="text-lg font-bold tracking-widest text-white" xClassName="text-violet-400" />
        <div className="text-[10px] tracking-[0.2em] text-violet-400 mt-1">ADMIN PANEL</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const badgeCount = badges?.[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-violet-600/15 text-white border border-violet-600/30"
                  : "hover:bg-neutral-900 hover:text-white border border-transparent",
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 ? (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-violet-500 text-[11px] font-semibold text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <div className="text-xs text-neutral-400">
          <div className="text-neutral-200 font-medium">{admin.name}</div>
          <div>{admin.role.replaceAll("_", " ")}</div>
        </div>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 border border-neutral-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors">
            <LogOut className="size-4" /> Logout
          </button>
        </form>
      </div>
    </aside>
  );
}

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
import type { SessionAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/creators", label: "Creators", icon: Users },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/collaborations", label: "Collaborations", icon: Handshake },
  { href: "/admin/agreements", label: "Agreements", icon: FileSignature },
  { href: "/admin/billing", label: "Billing", icon: Wallet },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/email-accounts", label: "Email Accounts", icon: MailPlus },
  { href: "/admin/inquiries", label: "Inquiries", icon: Contact },
  { href: "/admin/documents", label: "Documents", icon: FolderOpen },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/legal", label: "Legal Pages", icon: Scale },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ admin }: { admin: SessionAdmin }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-neutral-950 border-r border-neutral-800 text-neutral-300">
      <div className="px-5 py-6">
        <VidlixWordmark className="text-lg font-bold tracking-widest text-white" xClassName="text-violet-400" />
        <div className="text-[10px] tracking-[0.2em] text-violet-400 mt-1">ADMIN PANEL</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
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
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <div className="text-xs text-neutral-400 mb-2">
          <div className="text-neutral-200 font-medium">{admin.name}</div>
          <div>{admin.role.replaceAll("_", " ")}</div>
        </div>
        <form action={logoutAction}>
          <button className="text-xs text-neutral-500 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

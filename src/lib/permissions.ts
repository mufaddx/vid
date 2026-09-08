import type { AdminRole } from "@prisma/client";
import type { SessionAdmin } from "@/lib/auth";

// Role-based access control, scoped at the same module granularity as the
// admin sidebar's nav items (the spec's own example — "Campaign Management
// access" — is phrased at this granularity, not per-button). SUPER_ADMIN
// always has full access (formalizes the previously-unused
// FULL_ACCESS_ROLES declared in src/lib/auth.ts).

export const MODULES = [
  "dashboard",
  "creators",
  "brands",
  "campaigns",
  "collaborations",
  "agreements",
  "billing",
  "inbox",
  "email-accounts",
  "inquiries",
  "documents",
  "blog",
  "legal",
  "reports",
  "notifications",
  "settings",
  "employees",
] as const;

export type Module = (typeof MODULES)[number];

// Every role can always reach the dashboard — it's the landing page a
// denied route redirects back to, so it must never itself be denied.
const MATRIX: Record<Exclude<AdminRole, "SUPER_ADMIN">, Module[]> = {
  TALENT_MANAGER: ["dashboard", "creators", "agreements", "collaborations", "documents", "inbox"],
  CAMPAIGN_MANAGER: ["dashboard", "brands", "campaigns", "collaborations", "agreements"],
  FINANCE_MANAGER: ["dashboard", "billing", "documents", "reports"],
  INBOX_MANAGER: ["dashboard", "inbox", "email-accounts", "inquiries"],
  VIEWER: ["dashboard", "reports"],
};

export function modulesForRole(role: AdminRole): readonly Module[] {
  if (role === "SUPER_ADMIN") return MODULES;
  return MATRIX[role];
}

export function hasPermission(role: AdminRole, module: Module): boolean {
  if (role === "SUPER_ADMIN") return true;
  return MATRIX[role].includes(module);
}

// Longest-prefix match from an /admin/... pathname to the module that
// governs it. Kept in sync with AdminSidebar's NAV hrefs.
const PATH_MODULES: [string, Module][] = [
  ["/admin/dashboard", "dashboard"],
  ["/admin/creators", "creators"],
  ["/admin/brands", "brands"],
  ["/admin/campaigns", "campaigns"],
  ["/admin/collaborations", "collaborations"],
  ["/admin/agreements", "agreements"],
  ["/admin/billing", "billing"],
  ["/admin/inbox", "inbox"],
  ["/admin/email-accounts", "email-accounts"],
  ["/admin/inquiries", "inquiries"],
  ["/admin/documents", "documents"],
  ["/admin/blog", "blog"],
  ["/admin/legal", "legal"],
  ["/admin/reports", "reports"],
  ["/admin/notifications", "notifications"],
  ["/admin/settings", "settings"],
  ["/admin/employees", "employees"],
];

export function moduleForPath(pathname: string): Module | null {
  let best: [string, Module] | null = null;
  for (const entry of PATH_MODULES) {
    if (pathname === entry[0] || pathname.startsWith(entry[0] + "/")) {
      if (!best || entry[0].length > best[0].length) best = entry;
    }
  }
  return best ? best[1] : null;
}

/** Guard for server actions — throws (surfaced as an unhandled action
 * error, consistent with this codebase's existing `.parse()`-throws
 * pattern) when the acting admin's role can't reach the given module. */
export async function requirePermission(session: SessionAdmin, module: Module): Promise<void> {
  if (!hasPermission(session.role, module)) {
    throw new Error(`Your role (${session.role.replaceAll("_", " ")}) does not have access to ${module.replaceAll("-", " ")}.`);
  }
}

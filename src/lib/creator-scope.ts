import "server-only";
import { prisma } from "@/lib/prisma";
import type { SessionAdmin } from "@/lib/auth";

// The two "manager" roles are the only ones creator-scoping ever applies
// to — every other role either has no `creators` module access at all
// (INBOX_MANAGER, FINANCE_MANAGER, VIEWER) or is SUPER_ADMIN (always
// unrestricted). Assigning specific creators is optional: a manager with
// zero assignments is unrestricted (today's behavior) — scoping only
// activates once at least one creator is explicitly assigned, so a
// freshly-created manager never sees an empty, "broken-looking" list.
const SCOPED_ROLES = new Set(["TALENT_MANAGER", "CAMPAIGN_MANAGER"]);

export type CreatorScope = "ALL" | string[];

export async function getManagedCreatorIds(session: SessionAdmin): Promise<CreatorScope> {
  if (!SCOPED_ROLES.has(session.role)) return "ALL";

  const rows = await prisma.employeeManagedCreator.findMany({
    where: { adminUserId: session.id },
    select: { creatorId: true },
  });
  if (rows.length === 0) return "ALL";
  return rows.map((r) => r.creatorId);
}

/** Prisma `where` fragment for `Creator.id` — spread this into any
 * `prisma.creator.findMany`/`findUnique` where clause that lists or
 * looks up creators a manager-role employee interacts with. */
export function creatorScopeWhere(scope: CreatorScope) {
  return scope === "ALL" ? {} : { id: { in: scope } };
}

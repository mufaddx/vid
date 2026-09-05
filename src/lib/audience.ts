import type { SocialAccount, SocialMetric } from "@prisma/client";

export type SocialAccountWithMetric = SocialAccount & { metric: SocialMetric | null };

/**
 * Total audience is always derived, never stored/typed manually
 * (spec §19): Instagram followers + YouTube subscribers + Facebook
 * followers.
 */
export function computeTotalAudience(accounts: SocialAccountWithMetric[]): number {
  return accounts.reduce((sum, account) => {
    if (!account.metric) return sum;
    if (account.platform === "YOUTUBE") return sum + account.metric.subscribers;
    return sum + account.metric.followers;
  }, 0);
}

export function audienceByPlatform(
  accounts: SocialAccountWithMetric[],
): Record<"INSTAGRAM" | "YOUTUBE" | "FACEBOOK", number> {
  const result = { INSTAGRAM: 0, YOUTUBE: 0, FACEBOOK: 0 };
  for (const account of accounts) {
    if (!account.metric) continue;
    const value =
      account.platform === "YOUTUBE" ? account.metric.subscribers : account.metric.followers;
    result[account.platform] = value;
  }
  return result;
}

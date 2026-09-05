import { connectSocialAccountAction } from "@/server/actions/creators";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatNumber, timeAgo } from "@/lib/format";
import type { SocialAccount, SocialMetric } from "@prisma/client";

const PLATFORM_LABEL = { INSTAGRAM: "Instagram", YOUTUBE: "YouTube", FACEBOOK: "Facebook" } as const;

export function SocialPanel({
  creatorId,
  accounts,
}: {
  creatorId: string;
  accounts: (SocialAccount & { metric: SocialMetric | null })[];
}) {
  const byPlatform = new Map(accounts.map((a) => [a.platform, a]));

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {(["INSTAGRAM", "YOUTUBE", "FACEBOOK"] as const).map((platform) => {
        const account = byPlatform.get(platform);
        const count = account?.metric
          ? platform === "YOUTUBE"
            ? account.metric.subscribers
            : account.metric.followers
          : 0;

        return (
          <div key={platform} className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-neutral-900">{PLATFORM_LABEL[platform]}</span>
              <StatusBadge status={account?.connectionStatus ?? "NOT_CONNECTED"} />
            </div>

            {account ? (
              <div className="mb-4">
                <div className="text-xs text-neutral-400">@{account.username}</div>
                <div className="text-2xl font-semibold mt-1">
                  {formatNumber(count)} <span className="text-xs font-normal text-neutral-400">{platform === "YOUTUBE" ? "subscribers" : "followers"}</span>
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  Updated {account.lastSyncedAt ? timeAgo(account.lastSyncedAt) : "never"}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 mb-4">Not connected yet.</p>
            )}

            <form action={connectSocialAccountAction.bind(null, creatorId)} className="space-y-2 pt-3 border-t border-neutral-100">
              <input type="hidden" name="platform" value={platform} />
              <Label className="text-xs text-neutral-500">Username</Label>
              <Input name="username" defaultValue={account?.username ?? ""} placeholder="handle" className="h-8 text-sm" required />
              <Label className="text-xs text-neutral-500">{platform === "YOUTUBE" ? "Subscribers" : "Followers"}</Label>
              <Input
                name={platform === "YOUTUBE" ? "subscribers" : "followers"}
                type="number"
                min={0}
                defaultValue={count || undefined}
                className="h-8 text-sm"
                required
              />
              <input type="hidden" name={platform === "YOUTUBE" ? "followers" : "subscribers"} value="0" />
              <Button type="submit" size="sm" variant="outline" className="w-full mt-1">
                {account ? "Update" : "Connect"}
              </Button>
            </form>
          </div>
        );
      })}
    </div>
  );
}

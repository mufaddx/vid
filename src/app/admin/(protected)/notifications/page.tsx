import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { timeAgo } from "@/lib/format";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { creator: true } });

  return (
    <div>
      <PageHeader title="Notifications" description="Everything that needs your attention across VIDLIX" />
      <div className="p-8">
        {logs.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  {log.action}
                  {log.creator ? <span className="text-neutral-400"> — {log.creator.name}</span> : null}
                </span>
                <span className="text-xs text-neutral-400">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

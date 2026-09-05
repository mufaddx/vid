import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function logActivity(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  creatorId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      creatorId: input.creatorId ?? null,
      metadata: input.metadata,
    },
  });
}

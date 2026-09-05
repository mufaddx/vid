import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Generates the next sequential document number for a given prefix, e.g.
 * AGR-2026-00001, INV-2026-00002, PAY-2026-00001, PAYOUT-2026-00001.
 *
 * Uses an upsert + increment inside the caller's transaction (or a fresh
 * one) so numbers are never duplicated even under concurrent requests —
 * see spec §44.
 */
export async function nextDocumentNumber(
  prefix: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const client = tx ?? prisma;
  const year = new Date().getFullYear();

  const sequence = await client.documentSequence.upsert({
    where: { prefix_year: { prefix, year } },
    update: { lastN: { increment: 1 } },
    create: { prefix, year, lastN: 1 },
  });

  const padded = String(sequence.lastN).padStart(5, "0");
  return `${prefix}-${year}-${padded}`;
}

import "server-only";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Resend inbound-email webhook — the other half of the creator mailbox
 * feature. Outbound (sendEmail) has existed since Phase 4; this is what
 * makes a reply from the external recipient actually show up in the
 * VIDLIX Inbox instead of vanishing.
 *
 * Setup required OUTSIDE this codebase (cannot be done from here):
 *  1. In the Resend dashboard, add an MX record for vidlix.in (or a
 *     subdomain of it) pointing at Resend's receiving servers, per
 *     https://resend.com/docs/dashboard/receiving/introduction — this is a
 *     DNS change on the domain's registrar/DNS panel (Hostinger).
 *  2. Create a webhook in Resend for the "email.received" event pointing at
 *     https://vidlix.in/api/webhooks/inbound-email
 *  3. Copy the signing secret Resend gives that webhook into
 *     RESEND_WEBHOOK_SECRET in production's .env (a secret is already
 *     pre-generated there, currently commented out — uncomment once the
 *     webhook exists in the Resend dashboard using that same value, or
 *     replace it with whatever Resend actually issues).
 * Without steps 1-2 (external, DNS + dashboard config), no request will
 * ever reach this route — inbound mail has nowhere to be routed to Resend
 * in the first place. This route is what fires once that's wired up.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Not configured yet — accept but no-op, rather than 500ing on every
    // retry Resend would otherwise send.
    console.warn("[inbound-email] RESEND_WEBHOOK_SECRET not set; ignoring webhook call.");
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

  let event;
  try {
    event = resend.webhooks.verify({
      payload: rawBody,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret: secret,
    });
  } catch (err) {
    console.error("[inbound-email] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "email.received") {
    // Some other event type this endpoint isn't registered for — ack it
    // quietly so Resend doesn't retry.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { email_id, from, to, received_for, subject, message_id } = event.data;

  // Idempotency: Resend may retry a webhook delivery — skip if we've
  // already recorded this exact provider message.
  const already = await prisma.emailMessage.findFirst({ where: { providerMessageId: email_id } });
  if (already) {
    return NextResponse.json({ ok: true, deduped: true }, { status: 200 });
  }

  const candidates = [...(received_for ?? []), ...(to ?? [])].map((a) => a.toLowerCase());
  const account = await prisma.creatorEmailAccount.findFirst({
    where: { emailAddress: { in: candidates } },
  });

  if (!account) {
    console.warn(`[inbound-email] no mailbox matches recipients: ${candidates.join(", ")}`);
    return NextResponse.json({ ok: true, unmatched: true }, { status: 200 });
  }

  // The webhook event carries metadata only — fetch the actual body.
  let html: string | null = null;
  let text: string | null = null;
  try {
    const full = await resend.emails.receiving.get(email_id);
    html = full.data?.html ?? null;
    text = full.data?.text ?? null;
  } catch (err) {
    console.error("[inbound-email] failed to fetch full body for", email_id, err);
  }

  // Thread matching: the recipient's reply almost always keeps the subject
  // (with a "Re:" prefix their mail client adds). Match the most recently
  // active open thread on this mailbox with the same normalized subject;
  // otherwise start a new thread — never drop the message.
  const normalizedSubject = subject.replace(/^(re|fwd?):\s*/i, "").trim().toLowerCase();
  const threads = await prisma.emailThread.findMany({
    where: { creatorEmailAccountId: account.id },
    orderBy: { lastMessageAt: "desc" },
    take: 25,
  });
  const matchedThread = threads.find(
    (t) => t.subject.replace(/^(re|fwd?):\s*/i, "").trim().toLowerCase() === normalizedSubject,
  );

  const thread = matchedThread
    ? matchedThread
    : await prisma.emailThread.create({
        data: { creatorEmailAccountId: account.id, subject, lastMessageAt: new Date() },
      });

  await prisma.emailMessage.create({
    data: {
      threadId: thread.id,
      providerMessageId: email_id,
      fromEmail: from,
      toEmail: account.emailAddress,
      subject,
      htmlBody: html,
      textBody: text,
      direction: "INBOUND",
      status: "RECEIVED",
      receivedAt: new Date(),
    },
  });

  await prisma.emailThread.update({
    where: { id: thread.id },
    // Re-flag unread even on an already-read thread — a fresh inbound
    // message means there's something new to see again.
    data: { lastMessageAt: new Date(), status: "OPEN", unread: true },
  });

  console.log(`[inbound-email] stored message ${message_id} from ${from} into thread ${thread.id}`);
  return NextResponse.json({ ok: true }, { status: 200 });
}

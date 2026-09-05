import "server-only";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const FROM = process.env.EMAIL_FROM || "VIDLIX <hello@vidlix.in>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  template?: string;
  from?: string; // overrides EMAIL_FROM — e.g. a specific creator mailbox
};

/**
 * Sends transactional email via Resend when RESEND_API_KEY is configured;
 * otherwise (local prototype default) logs the email to the EmailLog table
 * and console instead of failing or pretending to deliver — spec §174
 * ("do not fake" applies to social metrics but the same principle holds
 * here: never silently swallow a send).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = input.from || FROM;

  if (!apiKey) {
    await prisma.emailLog.create({
      data: {
        toEmail: input.to,
        fromEmail: from,
        subject: input.subject,
        template: input.template,
        body: input.html,
        status: "MOCKED",
      },
    });
    console.log(`[email:mocked] from=${from} to=${input.to} subject="${input.subject}"`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    await prisma.emailLog.create({
      data: {
        toEmail: input.to,
        fromEmail: from,
        subject: input.subject,
        template: input.template,
        body: input.html,
        status: "SENT",
      },
    });
  } catch (err) {
    await prisma.emailLog.create({
      data: {
        toEmail: input.to,
        fromEmail: from,
        subject: input.subject,
        template: input.template,
        body: input.html,
        status: "FAILED",
        error: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}

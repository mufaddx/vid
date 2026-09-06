"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { nextDocumentNumber } from "@/lib/numbering";
import { saveFile, safeFilename } from "@/lib/storage";
import { renderInvoicePdf } from "@/lib/pdf/invoice-pdf";
import { renderReceiptPdf } from "@/lib/pdf/receipt-pdf";
import { renderPayoutStatementPdf } from "@/lib/pdf/payout-statement-pdf";
import { sendEmail } from "@/lib/email/send";
import { invoiceCreatedEmail, paymentReceivedEmail, payoutReleasedEmail } from "@/lib/email/templates";
import { formatDate, formatINR } from "@/lib/format";

const invoiceSchema = z.object({
  invoiceType: z.enum(["CREATOR_MANAGEMENT", "BRAND_CAMPAIGN"]),
  creatorId: z.string().min(1),
  brandId: z.string().optional(),
  campaignId: z.string().optional(),
  agreementId: z.string().optional(),
  description: z.string().min(2),
  subtotal: z.coerce.number().positive(),
  tax: z.coerce.number().nonnegative().default(0),
  discount: z.coerce.number().nonnegative().default(0),
  dueDate: z.string().min(1),
});

export async function createInvoiceAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = invoiceSchema.parse(Object.fromEntries(formData.entries()));
  const total = data.subtotal + data.tax - data.discount;

  const [company, creator, brand, campaign] = await Promise.all([
    prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } }),
    prisma.creator.findUniqueOrThrow({ where: { id: data.creatorId } }),
    data.brandId ? prisma.brand.findUnique({ where: { id: data.brandId } }) : null,
    data.campaignId ? prisma.campaign.findUnique({ where: { id: data.campaignId } }) : null,
  ]);

  const invoiceNumber = await nextDocumentNumber(company.invoicePrefix);
  const billToName = data.invoiceType === "BRAND_CAMPAIGN" ? brand?.name ?? creator.name : creator.name;

  // A freshly created invoice is always status "ISSUED" in the database
  // (see prisma.invoice.create below) — the PDF badge must reflect that
  // real status, not an invented label unrelated to the InvoiceStatus enum.
  const pdfBuffer = await renderInvoicePdf({
    company,
    invoiceNumber,
    invoiceTypeLabel: data.invoiceType === "BRAND_CAMPAIGN" ? "Brand Collaboration Invoice" : "Creator Management Invoice",
    issueDate: new Date(),
    dueDate: new Date(data.dueDate),
    billToName,
    billToSubtitle: campaign ? `Campaign: ${campaign.name}${data.invoiceType === "BRAND_CAMPAIGN" ? ` · Creator: ${creator.name}` : ""}` : undefined,
    lineItems: [{ description: data.description, amount: data.subtotal }],
    subtotal: data.subtotal,
    tax: data.tax,
    discount: data.discount,
    total,
    status: "PAYMENT PENDING",
  });

  const assetId = await saveFile(pdfBuffer, {
    filename: `${invoiceNumber}-${safeFilename(billToName)}.pdf`,
  });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceType: data.invoiceType,
      creatorId: data.creatorId,
      brandId: data.brandId || undefined,
      campaignId: data.campaignId || undefined,
      agreementId: data.agreementId || undefined,
      status: "ISSUED",
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount,
      total,
      pendingAmount: total,
      description: data.description,
      dueDate: new Date(data.dueDate),
      createdById: session.id,
      pdfAssetId: assetId,
    },
  });

  await prisma.document.create({
    data: { creatorId: data.creatorId, category: "INVOICE", title: `${invoiceNumber} — Invoice`, assetId },
  });

  await logActivity({
    actorId: session.id,
    action: `Invoice ${invoiceNumber} created`,
    entityType: "Invoice",
    entityId: invoice.id,
    creatorId: data.creatorId,
  });

  const recipientEmail = data.invoiceType === "BRAND_CAMPAIGN" ? brand?.email : creator.email;
  const recipientName = data.invoiceType === "BRAND_CAMPAIGN" ? brand?.name : creator.name;
  if (recipientEmail) {
    await sendEmail({
      to: recipientEmail,
      subject: `VIDLIX Invoice ${invoiceNumber}`,
      html: invoiceCreatedEmail({
        recipientName: recipientName ?? "there",
        invoiceNumber,
        amount: formatINR(total),
        dueDate: formatDate(data.dueDate),
      }),
      template: "invoice_created",
    });
  }

  redirect(`/admin/billing/invoices/${invoice.id}`);
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.string().min(1),
  transactionReference: z.string().optional(),
  utr: z.string().optional(),
  notes: z.string().optional(),
});

export async function recordPaymentAction(invoiceId: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = paymentSchema.parse(Object.fromEntries(formData.entries()));

  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: { creator: true, brand: true, campaign: true },
  });
  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });

  const newPaid = Number(invoice.paidAmount) + data.amount;
  const newPending = Math.max(Number(invoice.total) - newPaid, 0);
  const newStatus = newPending <= 0 ? "PAID" : "PARTIALLY_PAID";

  const paymentNumber = await nextDocumentNumber(company.paymentPrefix);
  const payer = invoice.invoiceType === "BRAND_CAMPAIGN" ? invoice.brand?.name ?? "Brand" : invoice.creator?.name ?? "Creator";

  const receiptBuffer = await renderReceiptPdf({
    company,
    receiptNumber: paymentNumber.replace(company.paymentPrefix, company.receiptPrefix),
    paymentDate: new Date(),
    receivedFrom: payer,
    invoiceNumber: invoice.invoiceNumber,
    campaignName: invoice.campaign?.name,
    amount: data.amount,
    method: data.method,
    transactionReference: data.transactionReference,
  });
  const receiptAssetId = await saveFile(receiptBuffer, {
    filename: `${paymentNumber}-receipt-${safeFilename(payer)}.pdf`,
  });

  await prisma.payment.create({
    data: {
      paymentNumber,
      invoiceId,
      payer,
      amount: data.amount,
      method: data.method,
      transactionReference: data.transactionReference,
      utr: data.utr,
      notes: data.notes,
      receiptPdfAssetId: receiptAssetId,
    },
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount: newPaid, pendingAmount: newPending, status: newStatus },
  });

  await prisma.document.create({
    data: {
      creatorId: invoice.creatorId,
      category: "RECEIPT",
      title: `${paymentNumber} — Payment Receipt`,
      assetId: receiptAssetId,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Payment recorded against ${invoice.invoiceNumber}`,
    entityType: "Invoice",
    entityId: invoiceId,
    creatorId: invoice.creatorId,
  });

  const recipientEmail = invoice.invoiceType === "BRAND_CAMPAIGN" ? invoice.brand?.email : invoice.creator?.email;
  if (recipientEmail) {
    await sendEmail({
      to: recipientEmail,
      subject: `Payment received — ${invoice.invoiceNumber}`,
      html: paymentReceivedEmail({ recipientName: payer, invoiceNumber: invoice.invoiceNumber, amount: formatINR(data.amount) }),
      template: "payment_received",
    });
  }

  revalidatePath(`/admin/billing/invoices/${invoiceId}`);
}

const payoutSchema = z.object({
  creatorId: z.string().min(1),
  campaignId: z.string().optional(),
  invoiceId: z.string().optional(),
  grossAmount: z.coerce.number().positive(),
  commissionPercentage: z.coerce.number().min(0).max(100),
  adjustment: z.coerce.number().default(0),
});

export async function createPayoutAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = payoutSchema.parse(Object.fromEntries(formData.entries()));
  const commissionAmount = Math.round(data.grossAmount * (data.commissionPercentage / 100));
  const creatorAmount = data.grossAmount - commissionAmount;
  const netPayable = creatorAmount + data.adjustment;

  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });
  const payoutNumber = await nextDocumentNumber(company.payoutPrefix);

  await prisma.payout.create({
    data: {
      payoutNumber,
      creatorId: data.creatorId,
      campaignId: data.campaignId || undefined,
      invoiceId: data.invoiceId || undefined,
      grossAmount: data.grossAmount,
      commissionPercentage: data.commissionPercentage,
      commissionAmount,
      creatorAmount,
      adjustment: data.adjustment,
      netPayable,
      pendingAmount: netPayable,
      status: "PENDING",
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Payout ${payoutNumber} created`,
    entityType: "Payout",
    entityId: payoutNumber,
    creatorId: data.creatorId,
  });

  revalidatePath(`/admin/creators/${data.creatorId}`);
  redirect(`/admin/creators/${data.creatorId}`);
}

export async function markPayoutPaidAction(payoutId: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const transactionReference = String(formData.get("transactionReference") || "");

  const payout = await prisma.payout.findUniqueOrThrow({
    where: { id: payoutId },
    include: { creator: true, campaign: true },
  });
  const company = await prisma.companySettings.findUniqueOrThrow({ where: { id: "company" } });

  const statementBuffer = await renderPayoutStatementPdf({
    company,
    payoutNumber: payout.payoutNumber,
    creatorName: payout.creator.name,
    campaignName: payout.campaign?.name,
    campaignValue: Number(payout.grossAmount),
    commissionPercentage: Number(payout.commissionPercentage),
    commissionAmount: Number(payout.commissionAmount),
    creatorShare: Number(payout.netPayable),
    paidAmount: Number(payout.netPayable),
    pendingAmount: 0,
    paymentDate: new Date(),
    transactionReference,
  });
  const statementAssetId = await saveFile(statementBuffer, {
    filename: `${payout.payoutNumber}-${safeFilename(payout.creator.name)}.pdf`,
  });

  await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: "PAID",
      paidAmount: payout.netPayable,
      pendingAmount: 0,
      paymentDate: new Date(),
      transactionReference,
      statementPdfAssetId: statementAssetId,
    },
  });

  await prisma.document.create({
    data: {
      creatorId: payout.creatorId,
      category: "PAYOUT_STATEMENT",
      title: `${payout.payoutNumber} — Payout Statement`,
      assetId: statementAssetId,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Payout ${payout.payoutNumber} released`,
    entityType: "Payout",
    entityId: payoutId,
    creatorId: payout.creatorId,
  });

  if (payout.creator.email) {
    await sendEmail({
      to: payout.creator.email,
      subject: "Your VIDLIX payout has been released",
      html: payoutReleasedEmail({ creatorName: payout.creator.name, amount: formatINR(Number(payout.netPayable)) }),
      template: "payout_released",
    });
  }

  revalidatePath(`/admin/creators/${payout.creatorId}`);
}

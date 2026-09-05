import { Document, renderToBuffer } from "@react-pdf/renderer";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import {
  StructuredDocTitle,
  RelationshipBar,
  StructuredMetaRow,
  SectionLabel,
  StructuredParagraph,
  DataTable,
  StructuredTotals,
  StructuredSignatureRow,
} from "@/lib/pdf/structured-blocks";
import {
  type BrandCollaborationDetails,
  deliverableLabel,
  deliverableAmount,
  adUsageLabel,
  computeBrandCollaborationTotals,
} from "@/lib/agreement-details";
import { formatDate, formatINR } from "@/lib/format";

export type BrandCollaborationPdfInput = {
  company: CompanySettings;
  agreementNumber: string;
  date: Date;
  brandName: string;
  creatorName: string;
  details: BrandCollaborationDetails;
  signatures: {
    signerType: "ADMIN" | "CREATOR" | "BRAND";
    signerName: string;
    signedAt: Date;
  }[];
};

function BrandCollaborationDocument({ input }: { input: BrandCollaborationPdfInput }) {
  const { details } = input;
  const { lineItems, subtotal, tax, total } = computeBrandCollaborationTotals(details);
  const enabledAds = details.advertising.filter((a) => a.enabled);

  const brandSig = input.signatures.find((s) => s.signerType === "BRAND");
  const adminSig = input.signatures.find((s) => s.signerType === "ADMIN");
  const creatorSig = input.signatures.find((s) => s.signerType === "CREATOR");

  return (
    <Document>
      <LetterheadPage company={input.company}>
        <StructuredDocTitle>BRAND COLLABORATION AGREEMENT</StructuredDocTitle>
        <RelationshipBar parties={[input.brandName, input.company.companyName, input.creatorName]} />

        <StructuredMetaRow
          items={[
            { label: "Agreement No.", value: input.agreementNumber },
            { label: "Date", value: formatDate(input.date) },
            { label: "Campaign", value: details.campaignName || "—" },
            { label: "Campaign Period", value: `${formatDate(details.campaignStartDate)} – ${formatDate(details.campaignEndDate)}` },
          ]}
        />

        <SectionLabel>Parties</SectionLabel>
        <DataTable
          columns={[
            { key: "role", label: "Role", width: 90 },
            { key: "name", label: "Name / Contact" },
          ]}
          rows={[
            { role: "Brand", name: `${input.brandName}${details.brandContactName ? ` — ${details.brandContactName}` : ""}${details.brandContactEmail ? ` (${details.brandContactEmail})` : ""}` },
            { role: "Creator", name: `${input.creatorName}${details.creatorSocialSummary ? ` — ${details.creatorSocialSummary}` : ""}` },
          ]}
        />

        {details.campaignDescription ? (
          <>
            <SectionLabel>Campaign Description</SectionLabel>
            <StructuredParagraph>{details.campaignDescription}</StructuredParagraph>
          </>
        ) : null}

        {details.deliverables.length > 0 ? (
          <>
            <SectionLabel>Deliverables</SectionLabel>
            <DataTable
              columns={[
                { key: "type", label: "Deliverable" },
                { key: "qty", label: "Qty", align: "right", width: 45 },
                { key: "rate", label: "Rate", align: "right", width: 90 },
                { key: "amount", label: "Amount", align: "right", width: 90 },
              ]}
              rows={details.deliverables.map((d) => ({
                type: deliverableLabel(d),
                qty: String(d.quantity),
                rate: formatINR(d.rate),
                amount: formatINR(deliverableAmount(d)),
              }))}
            />
          </>
        ) : null}

        {enabledAds.length > 0 ? (
          <>
            <SectionLabel>Paid Advertising / Media Usage</SectionLabel>
            <DataTable
              columns={[
                { key: "platform", label: "Platform" },
                { key: "duration", label: "Duration", width: 70 },
                { key: "fee", label: "Fee", align: "right", width: 80 },
                { key: "status", label: "Authorization", width: 90 },
              ]}
              rows={enabledAds.map((a) => ({
                platform: adUsageLabel(a),
                duration: a.durationDays ? `${a.durationDays} Days` : "—",
                fee: formatINR(a.fee),
                status: a.authorizationStatus.replaceAll("_", " "),
              }))}
            />
          </>
        ) : null}

        {lineItems.length > 0 ? (
          <>
            <SectionLabel>Commercial Pricing</SectionLabel>
            <StructuredTotals subtotal={subtotal} tax={tax} total={total} formatAmount={formatINR} />
          </>
        ) : null}

        {details.paymentTerms ? (
          <>
            <SectionLabel>Payment Terms</SectionLabel>
            <StructuredParagraph>{details.paymentTerms}</StructuredParagraph>
          </>
        ) : null}

        <StructuredSignatureRow
          signers={[
            { label: "Brand Authorized Representative", name: brandSig?.signerName, date: brandSig ? formatDate(brandSig.signedAt) : undefined },
            { label: `${input.company.companyName} Authorized Representative`, name: adminSig?.signerName, date: adminSig ? formatDate(adminSig.signedAt) : undefined },
            { label: "Creator", name: creatorSig?.signerName ?? input.creatorName, date: creatorSig ? formatDate(creatorSig.signedAt) : undefined },
          ]}
        />
      </LetterheadPage>
    </Document>
  );
}

export async function renderBrandCollaborationPdf(input: BrandCollaborationPdfInput): Promise<Buffer> {
  return renderToBuffer(<BrandCollaborationDocument input={input} />);
}

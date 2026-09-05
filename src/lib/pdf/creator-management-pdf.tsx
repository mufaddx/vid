import { Document, renderToBuffer } from "@react-pdf/renderer";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import {
  StructuredDocTitle,
  StructuredMetaRow,
  SectionLabel,
  StructuredParagraph,
  DataTable,
  StructuredSignatureRow,
} from "@/lib/pdf/structured-blocks";
import type { CreatorManagementDetails } from "@/lib/agreement-details";
import { CHARGE_TYPES } from "@/lib/agreement-details";
import { formatDate, formatINR } from "@/lib/format";

export type CreatorManagementPdfInput = {
  company: CompanySettings;
  agreementNumber: string;
  date: Date;
  creatorName: string;
  creatorAddress: string;
  details: CreatorManagementDetails;
  signatures: {
    signerType: "ADMIN" | "CREATOR";
    signerName: string;
    signedAt: Date;
    method?: string;
    signatureAsset?: string;
  }[];
};

function chargeLabel(v: string): string {
  return CHARGE_TYPES.find((c) => c.value === v)?.label ?? v;
}

function socialAccountRows(details: CreatorManagementDetails): { platform: string; username: string; commission: string }[] {
  const handles = details.socialHandles ?? {};
  const commissions = details.platformCommissions ?? {};
  const rows: { platform: string; username: string; commission: string }[] = [];
  if (handles.instagram) {
    rows.push({ platform: "Instagram", username: `@${handles.instagram}`, commission: commissions.instagram != null ? `${commissions.instagram}%` : "—" });
  }
  if (handles.youtube) {
    rows.push({ platform: "YouTube", username: handles.youtube, commission: commissions.youtube != null ? `${commissions.youtube}%` : "—" });
  }
  if (handles.facebook) {
    rows.push({ platform: "Facebook", username: handles.facebook, commission: commissions.facebook != null ? `${commissions.facebook}%` : "—" });
  }
  return rows;
}

function CreatorManagementDocument({ input }: { input: CreatorManagementPdfInput }) {
  const { details } = input;
  const adminSig = input.signatures.find((s) => s.signerType === "ADMIN");
  const creatorSig = input.signatures.find((s) => s.signerType === "CREATOR");

  return (
    <Document>
      <LetterheadPage company={input.company}>
        <StructuredDocTitle>CREATOR MANAGEMENT AGREEMENT</StructuredDocTitle>

        <StructuredMetaRow
          items={[
            { label: "Agreement No.", value: input.agreementNumber },
            { label: "Agreement Date", value: formatDate(details.agreementDate) },
            { label: "Creator", value: input.creatorName },
            { label: "Address", value: input.creatorAddress || "—" },
          ]}
        />

        <StructuredParagraph>
          {`This Creator Management Agreement ("Agreement") is entered into on ${formatDate(input.date)} between ${input.company.companyName} ("VIDLIX") and ${input.creatorName}, residing at ${input.creatorAddress} ("Creator"). The Creator appoints VIDLIX as their management representative for securing, negotiating and administering brand collaborations on the Creator's behalf. This Agreement remains in effect until terminated in writing by either party.`}
        </StructuredParagraph>

        {socialAccountRows(details).length > 0 ? (
          <>
            <SectionLabel>Creator&rsquo;s Social Media Accounts &amp; Commission</SectionLabel>
            <DataTable
              columns={[
                { key: "platform", label: "Platform" },
                { key: "username", label: "Username" },
                { key: "commission", label: "Commission", align: "right", width: 80 },
              ]}
              rows={socialAccountRows(details)}
            />
          </>
        ) : null}

        <SectionLabel>Commercial Terms</SectionLabel>
        <DataTable
          columns={[
            { key: "item", label: "Item" },
            { key: "value", label: "Value", align: "right", width: 160 },
          ]}
          rows={[
            {
              item: "Monthly Management Fee",
              value: details.monthlyFee.isFree ? "FREE" : formatINR(details.monthlyFee.amount),
            },
          ]}
        />

        {details.additionalServices.length > 0 ? (
          <>
            <SectionLabel>Additional Services</SectionLabel>
            <DataTable
              columns={[
                { key: "name", label: "Service" },
                { key: "chargeType", label: "Charge Type", width: 90 },
                { key: "amount", label: "Amount", align: "right", width: 110 },
              ]}
              rows={details.additionalServices.map((s) => ({
                name: s.name,
                chargeType: chargeLabel(s.chargeType),
                amount: s.isFree ? "Included, no charge" : formatINR(s.amount),
              }))}
            />
          </>
        ) : null}

        <SectionLabel>Management Terms</SectionLabel>
        <StructuredParagraph>{details.terms}</StructuredParagraph>

        <StructuredSignatureRow
          signers={[
            { label: `${input.company.companyName} Authorized Representative`, name: adminSig?.signerName, date: adminSig ? formatDate(adminSig.signedAt) : undefined },
            { label: "Creator", name: creatorSig?.signerName ?? input.creatorName, date: creatorSig ? formatDate(creatorSig.signedAt) : undefined },
          ]}
        />
      </LetterheadPage>
    </Document>
  );
}

export async function renderCreatorManagementPdf(input: CreatorManagementPdfInput): Promise<Buffer> {
  return renderToBuffer(<CreatorManagementDocument input={input} />);
}

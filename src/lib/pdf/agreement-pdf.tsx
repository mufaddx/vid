import { Document, renderToBuffer } from "@react-pdf/renderer";
import type { CompanySettings } from "@prisma/client";
import { LetterheadPage } from "@/lib/pdf/Letterhead";
import { DocTitle, MetaRow, SectionBlocks, SignatureBlock } from "@/lib/pdf/blocks";
import { parseSections } from "@/lib/agreement-content";
import { formatDate } from "@/lib/format";

export type AgreementPdfInput = {
  company: CompanySettings;
  agreementNumber: string;
  typeLabel: string;
  date: Date;
  creatorName: string;
  brandName?: string | null;
  content: string; // stringified sections
  signatures: {
    signerType: "ADMIN" | "CREATOR";
    signerName: string;
    signedAt: Date;
    method?: string;
    signatureAsset?: string;
  }[];
};

function imageOf(sig?: AgreementPdfInput["signatures"][number]) {
  return sig?.method === "draw" && sig.signatureAsset?.startsWith("data:") ? sig.signatureAsset : undefined;
}

function AgreementDocument({ input }: { input: AgreementPdfInput }) {
  const sections = parseSections(input.content);
  const adminSig = input.signatures.find((s) => s.signerType === "ADMIN");
  const creatorSig = input.signatures.find((s) => s.signerType === "CREATOR");

  return (
    <Document>
      <LetterheadPage company={input.company}>
        <DocTitle>{input.typeLabel.toUpperCase()}</DocTitle>
        <MetaRow
          items={[
            { label: "Agreement No.", value: input.agreementNumber },
            { label: "Date", value: formatDate(input.date) },
            { label: "Creator", value: input.creatorName },
            ...(input.brandName ? [{ label: "Brand", value: input.brandName }] : []),
          ]}
        />
        <SectionBlocks sections={sections} />
        <SignatureBlock
          left={{
            label: `${input.company.companyName} Authorized Representative`,
            name: adminSig?.signerName,
            imageDataUri: imageOf(adminSig),
            date: adminSig ? formatDate(adminSig.signedAt) : undefined,
          }}
          right={{
            label: "Creator",
            name: creatorSig?.signerName ?? input.creatorName,
            imageDataUri: imageOf(creatorSig),
            date: creatorSig ? formatDate(creatorSig.signedAt) : undefined,
          }}
        />
      </LetterheadPage>
    </Document>
  );
}

export async function renderAgreementPdf(input: AgreementPdfInput): Promise<Buffer> {
  return renderToBuffer(<AgreementDocument input={input} />);
}

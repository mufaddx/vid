import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseSections } from "@/lib/agreement-content";
import { formatDate, maskEmail } from "@/lib/format";
import { SigningFlow } from "@/components/signing/signing-flow";

export default async function AgreementSigningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { signingToken: token },
    include: { creator: true, brand: true, signatures: true },
  });

  if (!agreement) notFound();

  const sections = parseSections(agreement.content);

  return (
    <SigningFlow
      token={token}
      status={agreement.status}
      agreementNumber={agreement.agreementNumber}
      typeLabel={agreement.type.replaceAll("_", " ") + " Agreement"}
      date={formatDate(agreement.createdAt)}
      creatorName={agreement.creator.name}
      brandName={agreement.brand?.name}
      sections={sections}
      maskedEmail={agreement.creator.email ? maskEmail(agreement.creator.email) : "—"}
      alreadySigned={agreement.signatures.some((s) => s.signerType === "CREATOR")}
      finalPdfAssetId={agreement.finalPdfAssetId}
    />
  );
}

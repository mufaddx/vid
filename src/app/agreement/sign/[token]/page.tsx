import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseSections } from "@/lib/agreement-content";
import { parseDetails, resolveSocialHandles, type CreatorManagementDetails, type BrandCollaborationDetails } from "@/lib/agreement-details";
import { formatDate, maskEmail } from "@/lib/format";
import { SigningFlow } from "@/components/signing/signing-flow";

export default async function AgreementSigningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const include = { creator: { include: { socialAccounts: true } }, brand: true, signatures: true } as const;
  const [byCreator, byBrand] = await Promise.all([
    prisma.agreement.findUnique({ where: { signingToken: token }, include }),
    prisma.agreement.findUnique({ where: { brandSigningToken: token }, include }),
  ]);
  const agreement = byCreator ?? byBrand;
  const role: "CREATOR" | "BRAND" = byBrand ? "BRAND" : "CREATOR";

  if (!agreement) notFound();

  const sections = parseSections(agreement.content ?? "[]");
  const details = parseDetails(agreement.details);
  const signerEmail = role === "BRAND" ? agreement.brand?.email : agreement.creator.email;
  const signerDisplayName = role === "BRAND" ? agreement.brand?.contactPerson || agreement.brand?.name || "" : agreement.creator.name;
  const creatorAddress = [agreement.creator.address, agreement.creator.city, agreement.creator.state, agreement.creator.country]
    .filter(Boolean)
    .join(", ");

  return (
    <SigningFlow
      token={token}
      agreementId={agreement.id}
      status={agreement.status}
      agreementNumber={agreement.agreementNumber}
      typeLabel={agreement.type.replaceAll("_", " ") + " Agreement"}
      date={formatDate(agreement.createdAt)}
      creatorName={agreement.creator.name}
      creatorAddress={creatorAddress}
      brandName={agreement.brand?.name}
      sections={sections}
      structured={
        details
          ? {
              type: agreement.type as "CREATOR_MANAGEMENT" | "BRAND_COLLABORATION",
              details:
                agreement.type === "CREATOR_MANAGEMENT"
                  ? {
                      ...(details as CreatorManagementDetails),
                      socialHandles: resolveSocialHandles(details as CreatorManagementDetails, agreement.creator.socialAccounts),
                    }
                  : (details as BrandCollaborationDetails),
              commissionPercentage: Number(agreement.commissionPercentage),
            }
          : undefined
      }
      maskedEmail={signerEmail ? maskEmail(signerEmail) : "—"}
      signerRole={role}
      signerDisplayName={signerDisplayName}
      alreadySigned={agreement.signatures.some((s) => s.signerType === role)}
      finalPdfAssetId={agreement.finalPdfAssetId}
    />
  );
}

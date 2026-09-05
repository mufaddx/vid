import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { AgreementEditor } from "@/components/admin/agreement/editor";
import { CreatorManagementForm } from "@/components/admin/agreement/creator-management-form";
import { BrandCollaborationForm } from "@/components/admin/agreement/brand-collaboration-form";
import { AdminSignDialog } from "@/components/admin/agreement/sign-dialog";
import { SendForSignatureButton } from "@/components/admin/agreement/send-button";
import { parseSections } from "@/lib/agreement-content";
import { parseDetails, deriveSocialHandles, type CreatorManagementDetails, type BrandCollaborationDetails } from "@/lib/agreement-details";
import { formatDate, formatDateTime } from "@/lib/format";
import { Download, Mail } from "lucide-react";

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      creator: { include: { socialAccounts: true } },
      brand: true,
      campaign: true,
      signatures: true,
      auditLogs: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!agreement || !session) notFound();

  const details = parseDetails(agreement.details);
  const creatorSocialHandles = deriveSocialHandles(agreement.creator.socialAccounts);
  const creatorAddress = [agreement.creator.address, agreement.creator.city, agreement.creator.state, agreement.creator.country]
    .filter(Boolean)
    .join(", ");
  const hasAdminSignature = agreement.signatures.some((s) => s.signerType === "ADMIN");
  const hasCreatorSignature = agreement.signatures.some((s) => s.signerType === "CREATOR");
  const hasBrandSignature = agreement.signatures.some((s) => s.signerType === "BRAND");
  const isDraft = agreement.status === "DRAFT";
  const isBrandCollab = agreement.type === "BRAND_COLLABORATION";

  const relationshipLabel = isBrandCollab
    ? `${agreement.brand?.name ?? "Brand"} × VIDLIX × ${agreement.creator.name}`
    : `VIDLIX ↔ ${agreement.creator.name}`;

  return (
    <div>
      <PageHeader
        title={agreement.agreementNumber}
        description={`${agreement.type.replaceAll("_", " ")} · ${relationshipLabel}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={agreement.status} />
            <Button asChild variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800">
              <a
                href={agreement.finalPdfAssetId ? `/api/files/${agreement.finalPdfAssetId}` : `/api/agreements/${agreement.id}/pdf`}
                target="_blank"
              >
                <Download className="size-4" /> {agreement.finalPdfAssetId ? "Download Signed PDF" : "Download / Preview PDF"}
              </a>
            </Button>
            {isDraft && !hasAdminSignature ? (
              <AdminSignDialog agreementId={agreement.id} adminName={session.name} />
            ) : null}
            {isDraft && hasAdminSignature ? (
              <SendForSignatureButton agreementId={agreement.id} structured={!!details} />
            ) : null}
          </div>
        }
      />

      <div className="p-8 space-y-8">
        {details && agreement.type === "CREATOR_MANAGEMENT" ? (
          <CreatorManagementForm
            creators={[{ id: agreement.creatorId, name: agreement.creator.name, commissionPercentage: Number(agreement.commissionPercentage) }]}
            socialByCreator={{ [agreement.creatorId]: creatorSocialHandles }}
            addressByCreator={{ [agreement.creatorId]: creatorAddress }}
            defaultCreatorId={agreement.creatorId}
            defaultCommission={Number(agreement.commissionPercentage)}
            editAgreementId={agreement.id}
            agreementNumber={agreement.agreementNumber}
            initialDetails={{ ...(details as CreatorManagementDetails) }}
            readOnly={!isDraft}
          />
        ) : details && agreement.type === "BRAND_COLLABORATION" ? (
          <BrandCollaborationForm
            creators={[{ id: agreement.creatorId, name: agreement.creator.name }]}
            brands={agreement.brand ? [{ id: agreement.brand.id, name: agreement.brand.name, email: agreement.brand.email, contactPerson: agreement.brand.contactPerson }] : []}
            campaigns={agreement.campaign ? [{ id: agreement.campaign.id, name: agreement.campaign.name, brandId: agreement.brandId ?? "" }] : []}
            defaultCreatorId={agreement.creatorId}
            defaultBrandId={agreement.brandId ?? undefined}
            defaultCampaignId={agreement.campaignId ?? undefined}
            editAgreementId={agreement.id}
            initialDetails={{ ...(details as BrandCollaborationDetails) }}
            readOnly={!isDraft}
          />
        ) : (
          <AgreementEditor
            agreementId={agreement.id}
            initialSections={parseSections(agreement.content ?? "[]")}
            readOnly={!isDraft}
            meta={{
              agreementNumber: agreement.agreementNumber,
              typeLabel: agreement.type.replaceAll("_", " ") + " Agreement",
              date: formatDate(agreement.createdAt),
              creatorName: agreement.creator.name,
              brandName: agreement.brand?.name,
            }}
          />
        )}

        {isBrandCollab && agreement.status !== "DRAFT" ? (
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Signatures</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <SignerStatus label="Brand" signed={hasBrandSignature} />
              <SignerStatus label="VIDLIX" signed={hasAdminSignature} />
              <SignerStatus label="Creator" signed={hasCreatorSignature} />
            </div>
            {agreement.brand?.email ? (
              <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
                <Mail className="size-3.5" /> Brand signing link sent to {agreement.brand.email}
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Audit Trail</h3>
          <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {agreement.auditLogs.length === 0 ? (
              <div className="px-5 py-4 text-sm text-neutral-400">No events recorded yet.</div>
            ) : (
              agreement.auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span>{log.event}{log.actor ? ` — ${log.actor}` : ""}</span>
                  <span className="text-xs text-neutral-400">{formatDateTime(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignerStatus({ label, signed }: { label: string; signed: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm flex items-center justify-between ${signed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-neutral-200 bg-neutral-50 text-neutral-500"}`}>
      <span>{label}</span>
      <span className="text-xs font-medium">{signed ? "Signed" : "Pending"}</span>
    </div>
  );
}

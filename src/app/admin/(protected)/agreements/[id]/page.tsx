import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { AgreementEditor } from "@/components/admin/agreement/editor";
import { AdminSignDialog } from "@/components/admin/agreement/sign-dialog";
import { SendForSignatureButton } from "@/components/admin/agreement/send-button";
import { parseSections } from "@/lib/agreement-content";
import { formatDate, formatDateTime } from "@/lib/format";
import { Download } from "lucide-react";

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: { creator: true, brand: true, campaign: true, signatures: true, auditLogs: { orderBy: { createdAt: "asc" } } },
  });
  if (!agreement || !session) notFound();

  const sections = parseSections(agreement.content);
  const hasAdminSignature = agreement.signatures.some((s) => s.signerType === "ADMIN");
  const isDraft = agreement.status === "DRAFT";

  return (
    <div>
      <PageHeader
        title={agreement.agreementNumber}
        description={`${agreement.type.replaceAll("_", " ")} · ${agreement.creator.name}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={agreement.status} />
            {agreement.finalPdfAssetId ? (
              <Button asChild variant="outline">
                <a href={`/api/files/${agreement.finalPdfAssetId}`} target="_blank">
                  <Download className="size-4" /> Download PDF
                </a>
              </Button>
            ) : null}
            {isDraft && !hasAdminSignature ? (
              <AdminSignDialog agreementId={agreement.id} adminName={session.name} />
            ) : null}
            {isDraft && hasAdminSignature ? (
              <SendForSignatureButton agreementId={agreement.id} />
            ) : null}
          </div>
        }
      />

      <div className="p-8 space-y-8">
        <AgreementEditor
          agreementId={agreement.id}
          initialSections={sections}
          readOnly={!isDraft}
          meta={{
            agreementNumber: agreement.agreementNumber,
            typeLabel: agreement.type.replaceAll("_", " ") + " Agreement",
            date: formatDate(agreement.createdAt),
            creatorName: agreement.creator.name,
            brandName: agreement.brand?.name,
          }}
        />

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

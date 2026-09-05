import {
  type CreatorManagementDetails,
  type BrandCollaborationDetails,
  deliverableLabel,
  deliverableAmount,
  adUsageLabel,
  computeBrandCollaborationTotals,
} from "@/lib/agreement-details";
import { formatDate, formatINR } from "@/lib/format";

// Plain-HTML review shown inside the signing flow for structured
// agreements — a compact mirror of the one-page PDF, not a pixel-perfect
// replica (the PDF itself is what's legally signed).

export function StructuredAgreementSummary({
  type,
  details,
  agreementNumber,
  creatorName,
  creatorAddress,
  brandName,
  commissionPercentage,
}: {
  type: "CREATOR_MANAGEMENT" | "BRAND_COLLABORATION";
  details: CreatorManagementDetails | BrandCollaborationDetails;
  agreementNumber?: string;
  creatorName: string;
  creatorAddress?: string;
  brandName?: string;
  commissionPercentage: number;
}) {
  if (type === "CREATOR_MANAGEMENT") {
    const d = details as CreatorManagementDetails;
    const social = d.socialHandles ?? {};
    const commissions = d.platformCommissions ?? {};
    const socialRows: { platform: string; username: string; commission?: number }[] = [
      ...(social.instagram ? [{ platform: "Instagram", username: `@${social.instagram}`, commission: commissions.instagram }] : []),
      ...(social.youtube ? [{ platform: "YouTube", username: social.youtube, commission: commissions.youtube }] : []),
      ...(social.facebook ? [{ platform: "Facebook", username: social.facebook, commission: commissions.facebook }] : []),
    ];
    return (
      <div className="space-y-4 text-sm text-neutral-700">
        {agreementNumber ? <Row label="Agreement No." value={agreementNumber} /> : null}
        <Row label="Agreement Date" value={formatDate(d.agreementDate)} />
        <Row label="Creator" value={creatorName} />
        {creatorAddress ? <Row label="Address" value={creatorAddress} /> : null}
        <Row label="Monthly Management Fee" value={d.monthlyFee.isFree ? "FREE" : formatINR(d.monthlyFee.amount)} />
        {socialRows.length > 0 ? (
          <div>
            <div className="text-xs font-semibold text-neutral-500 mb-1">Creator&rsquo;s Social Media Accounts &amp; Commission</div>
            <ul className="space-y-1">
              {socialRows.map((r) => (
                <li key={r.platform} className="flex justify-between border-b border-neutral-100 py-1">
                  <span>{r.platform} — {r.username}</span>
                  <span className="text-neutral-500">{r.commission != null ? `${r.commission}% commission` : "—"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {d.additionalServices.length > 0 ? (
          <div>
            <div className="text-xs font-semibold text-neutral-500 mb-1">Additional Services</div>
            <ul className="space-y-1">
              {d.additionalServices.map((s) => (
                <li key={s.id} className="flex justify-between border-b border-neutral-100 py-1">
                  <span>{s.name}</span>
                  <span className="text-neutral-500">{s.isFree ? "Included, no charge" : formatINR(s.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <div className="text-xs font-semibold text-neutral-500 mb-1">Management Terms</div>
          <p className="text-neutral-600 leading-relaxed">{d.terms}</p>
        </div>
      </div>
    );
  }

  const d = details as BrandCollaborationDetails;
  const enabledAds = d.advertising.filter((a) => a.enabled);
  const { lineItems, subtotal, tax, total } = computeBrandCollaborationTotals(d);

  return (
    <div className="space-y-4 text-sm text-neutral-700">
      <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-center text-xs font-semibold text-violet-800">
        {brandName?.toUpperCase()} × VIDLIX × {creatorName.toUpperCase()}
      </div>
      <Row label="Campaign" value={d.campaignName || "—"} />
      <Row label="Campaign Period" value={`${formatDate(d.campaignStartDate)} – ${formatDate(d.campaignEndDate)}`} />
      {d.campaignDescription ? (
        <div>
          <div className="text-xs font-semibold text-neutral-500 mb-1">Campaign Description</div>
          <p className="text-neutral-600 leading-relaxed">{d.campaignDescription}</p>
        </div>
      ) : null}
      {d.deliverables.length > 0 ? (
        <div>
          <div className="text-xs font-semibold text-neutral-500 mb-1">Deliverables</div>
          <ul className="space-y-1">
            {d.deliverables.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-neutral-100 py-1">
                <span>{deliverableLabel(item)} — {item.quantity} × {formatINR(item.rate)}</span>
                <span className="text-neutral-500">{formatINR(deliverableAmount(item))}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {enabledAds.length > 0 ? (
        <div>
          <div className="text-xs font-semibold text-neutral-500 mb-1">Paid Advertising / Media Usage</div>
          <ul className="space-y-1">
            {enabledAds.map((a) => (
              <li key={a.id} className="flex justify-between border-b border-neutral-100 py-1">
                <span>
                  {adUsageLabel(a)}
                  {a.durationDays ? ` — ${a.durationDays} Days` : ""}
                </span>
                <span className="text-neutral-500">{formatINR(a.fee)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {lineItems.length > 0 ? (
        <div className="rounded-lg border border-neutral-200 p-3">
          <Row label="Subtotal" value={formatINR(subtotal)} />
          {tax > 0 ? <Row label="Tax" value={formatINR(tax)} /> : null}
          <div className="flex justify-between font-semibold text-neutral-900 border-t border-neutral-200 mt-1 pt-1">
            <span>Grand Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      ) : null}
      {d.paymentTerms ? (
        <div>
          <div className="text-xs font-semibold text-neutral-500 mb-1">Payment Terms</div>
          <p className="text-neutral-600 leading-relaxed">{d.paymentTerms}</p>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SignaturePad } from "@/components/signature-pad";
import {
  recordAgreementViewedAction,
  requestSigningOtpAction,
  verifySigningOtpAction,
  submitCreatorSignatureAction,
} from "@/server/actions/signing";
import type { AgreementSection } from "@/lib/agreement-content";
import type { CreatorManagementDetails, BrandCollaborationDetails } from "@/lib/agreement-details";
import { StructuredAgreementSummary } from "@/components/signing/structured-summary";
import { VidlixWordmark } from "@/components/vidlix-wordmark";
import { CheckCircle2, ShieldCheck } from "lucide-react";

type Step = "review" | "otp" | "sign" | "done";

export function SigningFlow({
  token,
  status,
  agreementNumber,
  typeLabel,
  date,
  creatorName,
  creatorAddress,
  brandName,
  sections,
  structured,
  maskedEmail,
  signerRole,
  signerDisplayName,
  alreadySigned,
  finalPdfAssetId,
}: {
  token: string;
  status: string;
  agreementNumber: string;
  typeLabel: string;
  date: string;
  creatorName: string;
  creatorAddress?: string;
  brandName?: string;
  sections: AgreementSection[];
  structured?: {
    type: "CREATOR_MANAGEMENT" | "BRAND_COLLABORATION";
    details: CreatorManagementDetails | BrandCollaborationDetails;
    commissionPercentage: number;
  };
  maskedEmail: string;
  signerRole: "CREATOR" | "BRAND";
  signerDisplayName: string;
  alreadySigned: boolean;
  finalPdfAssetId: string | null;
}) {
  const [step, setStep] = useState<Step>(status === "COMPLETED" ? "done" : "review");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string>();
  const [signError, setSignError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [downloadAssetId, setDownloadAssetId] = useState(finalPdfAssetId);

  useEffect(() => {
    if (status === "PENDING_SIGNATURE") {
      void recordAgreementViewedAction(token);
    }
  }, [token, status]);

  if (status !== "PENDING_SIGNATURE" && status !== "COMPLETED") {
    return (
      <Shell>
        <p className="text-neutral-600">This signing link is not currently active.</p>
      </Shell>
    );
  }

  if (step === "done" || alreadySigned) {
    return (
      <Shell>
        <div className="text-center py-6">
          <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900">
            {downloadAssetId ? "Agreement Completed" : "Signature Recorded"}
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            {downloadAssetId
              ? `Your agreement ${agreementNumber} has been successfully completed.`
              : `Thank you — your signature on agreement ${agreementNumber} has been recorded. It will be finalized once every party has signed.`}
          </p>
          {downloadAssetId ? (
            <Button asChild className="mt-6">
              <a href={`/api/files/${downloadAssetId}?token=${token}`} target="_blank">
                Download Signed Agreement
              </a>
            </Button>
          ) : null}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Agreement No.</div>
          <div className="font-semibold text-neutral-900">{agreementNumber}</div>
        </div>
        {signerRole === "BRAND" ? (
          <span className="text-[10px] tracking-wide font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1">
            SIGNING AS BRAND
          </span>
        ) : null}
      </div>

      {step === "review" ? (
        <>
          <div className="border border-neutral-200 rounded-xl bg-white p-6 max-h-[50vh] overflow-y-auto text-sm leading-relaxed">
            <div className="font-bold text-base mb-1">{typeLabel.toUpperCase()}</div>
            <div className="text-xs text-neutral-400 mb-4">
              {date} · {creatorName}
              {brandName ? ` · ${brandName}` : ""}
            </div>
            {structured ? (
              <StructuredAgreementSummary
                type={structured.type}
                details={structured.details}
                agreementNumber={agreementNumber}
                creatorName={creatorName}
                creatorAddress={creatorAddress}
                brandName={brandName}
                commissionPercentage={structured.commissionPercentage}
              />
            ) : (
              sections.map((s) => (
                <div key={s.id} className="mb-4">
                  <div className="font-semibold mb-1">{s.heading}</div>
                  {s.body.split("\n\n").filter((p) => p.trim() && p.trim() !== "---").map((p, i) => (
                    <p key={i} className="mb-1.5 text-neutral-700">{p}</p>
                  ))}
                </div>
              ))
            )}
          </div>
          <Button className="w-full mt-4" onClick={() => setStep("otp")}>
            Continue to Verification
          </Button>
        </>
      ) : null}

      {step === "otp" ? (
        <OtpStep
          token={token}
          maskedEmail={maskedEmail}
          otp={otp}
          setOtp={setOtp}
          error={otpError}
          pending={pending}
          onVerified={() => setStep("sign")}
          onRequest={() =>
            startTransition(async () => {
              setOtpError(undefined);
              const res = await requestSigningOtpAction(token);
              if (!res.ok) setOtpError(res.error);
            })
          }
          onVerify={() =>
            startTransition(async () => {
              setOtpError(undefined);
              const res = await verifySigningOtpAction(token, otp);
              if (res.ok) setStep("sign");
              else setOtpError(res.error);
            })
          }
        />
      ) : null}

      {step === "sign" ? (
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm mb-4">
            <ShieldCheck className="size-4" /> Identity verified
          </div>
          <h2 className="text-sm font-semibold text-neutral-800 mb-3">
            {signerRole === "BRAND" ? "BRAND SIGNATURE" : "CREATOR SIGNATURE"}
          </h2>
          <SignaturePad
            defaultName={signerDisplayName}
            confirmLabel={pending ? "Submitting…" : "Apply Signature"}
            onCapture={({ signerName, method, signatureAsset }) =>
              startTransition(async () => {
                setSignError(undefined);
                const res = await submitCreatorSignatureAction(token, { signerName, method, signatureAsset });
                if (res.ok) {
                  if (res.finalPdfAssetId) setDownloadAssetId(res.finalPdfAssetId);
                  setStep("done");
                } else {
                  setSignError(res.error);
                }
              })
            }
          />
          {signError ? <p className="text-sm text-red-600 mt-2">{signError}</p> : null}
        </div>
      ) : null}
    </Shell>
  );
}

function OtpStep({
  token,
  maskedEmail,
  otp,
  setOtp,
  error,
  pending,
  onRequest,
  onVerify,
}: {
  token: string;
  maskedEmail: string;
  otp: string;
  setOtp: (v: string) => void;
  error?: string;
  pending: boolean;
  onVerified: () => void;
  onRequest: () => void;
  onVerify: () => void;
}) {
  const [requested, setRequested] = useState(false);

  return (
    <div>
      <p className="text-sm text-neutral-600 mb-4">
        For your security, we need to verify your identity before you can sign.
      </p>
      {!requested ? (
        <Button
          className="w-full"
          disabled={pending}
          onClick={() => {
            setRequested(true);
            onRequest();
          }}
        >
          Send OTP to {maskedEmail}
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-neutral-500">
            OTP sent to: <span className="font-medium text-neutral-800">{maskedEmail}</span>
          </p>
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" disabled={pending || otp.length !== 6} onClick={onVerify}>
            {pending ? "Verifying…" : "Verify"}
          </Button>
          <button type="button" className="text-xs text-neutral-400 hover:text-neutral-700 block mx-auto" onClick={onRequest}>
            Resend code
          </button>
        </div>
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <VidlixWordmark className="text-xl font-bold tracking-widest text-neutral-900" />
          <div className="text-[10px] tracking-[0.2em] text-violet-500 mt-1">SECURE AGREEMENT SIGNING</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendForSignatureAction } from "@/server/actions/agreements";
import { sendStructuredAgreementForSignatureAction } from "@/server/actions/structured-agreements";
import { Send } from "lucide-react";

export function SendForSignatureButton({
  agreementId,
  disabled,
  structured,
  label = "Send for Signature",
}: {
  agreementId: string;
  disabled?: boolean;
  /** Use the structured send flow (also issues a brand signing link for Brand Collaboration agreements). */
  structured?: boolean;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          try {
            if (structured) await sendStructuredAgreementForSignatureAction(agreementId);
            else await sendForSignatureAction(agreementId);
            toast.success("Agreement sent for signature.");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send agreement.");
          }
        })
      }
    >
      <Send className="size-4" /> {pending ? "Sending…" : label}
    </Button>
  );
}

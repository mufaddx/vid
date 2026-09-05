"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendForSignatureAction } from "@/server/actions/agreements";
import { Send } from "lucide-react";

export function SendForSignatureButton({ agreementId, disabled }: { agreementId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await sendForSignatureAction(agreementId);
            toast.success("Agreement sent to creator for signature.");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send agreement.");
          }
        })
      }
    >
      <Send className="size-4" /> {pending ? "Sending…" : "Send for Signature"}
    </Button>
  );
}

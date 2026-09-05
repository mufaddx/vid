"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignaturePad } from "@/components/signature-pad";
import { adminSignAgreementAction } from "@/server/actions/agreements";
import { PenLine } from "lucide-react";

export function AdminSignDialog({ agreementId, adminName }: { agreementId: string; adminName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PenLine className="size-4" /> Sign as VIDLIX
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign on behalf of VIDLIX</DialogTitle>
        </DialogHeader>
        <SignaturePad
          defaultName={adminName}
          confirmLabel={pending ? "Applying…" : "Apply Signature"}
          onCapture={({ signerName, method, signatureAsset }) => {
            const fd = new FormData();
            fd.set("signerName", signerName);
            fd.set("method", method);
            fd.set("signatureAsset", signatureAsset);
            startTransition(async () => {
              await adminSignAgreementAction(agreementId, fd);
              setOpen(false);
              router.refresh();
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

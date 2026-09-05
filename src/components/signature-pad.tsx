"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SignaturePad({
  defaultName,
  onCapture,
  confirmLabel = "Apply Signature",
}: {
  defaultName?: string;
  onCapture: (input: { signerName: string; method: "draw" | "type"; signatureAsset: string }) => void;
  confirmLabel?: string;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [mode, setMode] = useState<"draw" | "type">("type");
  const sigRef = useRef<SignatureCanvas>(null);

  function confirm() {
    if (!name.trim()) return;
    if (mode === "type") {
      onCapture({ signerName: name.trim(), method: "type", signatureAsset: name.trim() });
      return;
    }
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUri = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      onCapture({ signerName: name.trim(), method: "draw", signatureAsset: dataUri });
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm text-neutral-600">Full Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your full legal name" />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
        <TabsList>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
        </TabsList>
        <TabsContent value="type" className="pt-4">
          <div className="border border-neutral-200 rounded-lg h-24 flex items-center justify-center bg-neutral-50">
            <span className="text-3xl" style={{ fontFamily: "cursive" }}>{name || "Your signature"}</span>
          </div>
        </TabsContent>
        <TabsContent value="draw" className="pt-4">
          <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <SignatureCanvas
              ref={sigRef}
              penColor="#111827"
              canvasProps={{ className: "w-full h-40" }}
            />
          </div>
          <button
            type="button"
            className="text-xs text-neutral-400 hover:text-neutral-700 mt-1"
            onClick={() => sigRef.current?.clear()}
          >
            Clear
          </button>
        </TabsContent>
      </Tabs>

      <Button onClick={confirm} disabled={!name.trim()} className="w-full">
        {confirmLabel}
      </Button>
    </div>
  );
}

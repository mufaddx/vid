"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAgreementContentAction } from "@/server/actions/agreements";
import { newSectionId, type AgreementSection } from "@/lib/agreement-content";
import {
  AgreementPreviewFrame,
  PreviewDocTitle,
  PreviewMetaRow,
  PreviewSectionHeading,
  PreviewSignatureRow,
} from "@/components/admin/agreement/preview-shell";
import { Plus, Trash2, Save } from "lucide-react";

export function AgreementEditor({
  agreementId,
  initialSections,
  readOnly,
  meta,
}: {
  agreementId: string;
  initialSections: AgreementSection[];
  readOnly: boolean;
  meta: { agreementNumber: string; typeLabel: string; date: string; creatorName: string; brandName?: string };
}) {
  const [sections, setSections] = useState<AgreementSection[]>(initialSections);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function update(id: string, field: "heading" | "body", value: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, { id: newSectionId(), heading: "New Section", body: "" }]);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function save() {
    const fd = new FormData();
    fd.set("sections", JSON.stringify(sections));
    startTransition(async () => {
      await updateAgreementContentAction(agreementId, fd);
      toast.success("Agreement content saved.");
      router.refresh();
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {!readOnly ? (
          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={pending}>
              <Save className="size-4" /> {pending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            This agreement is locked for editing (status: not a draft).
          </p>
        )}

        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={section.heading}
                onChange={(e) => update(section.id, "heading", e.target.value)}
                disabled={readOnly}
                className="font-medium"
              />
              {!readOnly ? (
                <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
                  <Trash2 className="size-4 text-neutral-400" />
                </Button>
              ) : null}
            </div>
            <Textarea
              value={section.body}
              onChange={(e) => update(section.id, "body", e.target.value)}
              disabled={readOnly}
              rows={4}
              className="text-sm"
            />
          </div>
        ))}

        {!readOnly ? (
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="size-4" /> Add Section
          </Button>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-6 self-start">
        <div className="text-xs text-neutral-400 mb-2 text-center">LIVE PREVIEW</div>
        <AgreementPreviewFrame>
          <PreviewDocTitle>{meta.typeLabel.toUpperCase()}</PreviewDocTitle>
          <PreviewMetaRow
            items={[
              { label: "Agreement No.", value: meta.agreementNumber },
              { label: "Date", value: meta.date },
              { label: "Creator", value: meta.creatorName },
              ...(meta.brandName ? [{ label: "Brand", value: meta.brandName }] : []),
            ]}
          />

          {sections.map((s) => (
            <div key={s.id} className="mb-4">
              <PreviewSectionHeading>{s.heading}</PreviewSectionHeading>
              {s.body.split("\n\n").filter((p) => p.trim() && p.trim() !== "---").map((p, i) => (
                <p key={i} className="mb-1.5 text-justify">{p}</p>
              ))}
            </div>
          ))}

          <PreviewSignatureRow signers={["VIDLIX Authorized Representative", `Creator — ${meta.creatorName}`]} />
        </AgreementPreviewFrame>
      </div>
    </div>
  );
}

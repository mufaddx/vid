"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAgreementContentAction } from "@/server/actions/agreements";
import { newSectionId, type AgreementSection } from "@/lib/agreement-content";
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
        <div className="mx-auto bg-white shadow-md border border-neutral-200 aspect-[210/297] w-full max-w-[560px] overflow-y-auto p-10 text-[11px] leading-relaxed text-neutral-800">
          <div className="flex items-start justify-between border-b border-neutral-200 pb-3 mb-6">
            <div>
              <div className="font-bold tracking-widest text-sm">VIDLIX</div>
              <div className="text-[8px] text-violet-600 tracking-widest mt-0.5">CREATORS • BRANDS • BEYOND</div>
            </div>
            <div className="text-right text-[9px] text-neutral-400">
              <div>hello@vidlix.in</div>
              <div>vidlix.in</div>
            </div>
          </div>

          <div className="font-bold text-sm mb-3">{meta.typeLabel.toUpperCase()}</div>
          <div className="flex gap-8 text-[9px] mb-6">
            <div><div className="text-neutral-400">Agreement No.</div><div className="font-semibold">{meta.agreementNumber}</div></div>
            <div><div className="text-neutral-400">Date</div><div className="font-semibold">{meta.date}</div></div>
            <div><div className="text-neutral-400">Creator</div><div className="font-semibold">{meta.creatorName}</div></div>
            {meta.brandName ? <div><div className="text-neutral-400">Brand</div><div className="font-semibold">{meta.brandName}</div></div> : null}
          </div>

          {sections.map((s) => (
            <div key={s.id} className="mb-4">
              <div className="font-semibold mb-1">{s.heading}</div>
              {s.body.split("\n\n").filter((p) => p.trim() && p.trim() !== "---").map((p, i) => (
                <p key={i} className="mb-1.5 text-justify">{p}</p>
              ))}
            </div>
          ))}

          <div className="flex justify-between mt-10 pt-6">
            <div className="w-[45%] border-t border-neutral-800 pt-1 text-[8px] text-neutral-500">
              VIDLIX Authorized Representative
            </div>
            <div className="w-[45%] border-t border-neutral-800 pt-1 text-[8px] text-neutral-500">
              Creator — {meta.creatorName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

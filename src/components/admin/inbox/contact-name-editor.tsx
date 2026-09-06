"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateThreadContactNameAction } from "@/server/actions/inbox";

/** Inline "who is this?" label editor — a bare email address rarely
 * carries the person's actual name, so an admin can attach one once and
 * have it show up everywhere this thread appears (list + detail). */
export function ContactNameEditor({ threadId, contactName }: { threadId: string; contactName: string | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(contactName ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    const fd = new FormData();
    fd.set("contactName", value);
    startTransition(async () => {
      await updateThreadContactNameAction(threadId, fd);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder="Add a name for this contact"
          className="h-7 text-xs w-48"
          disabled={pending}
        />
        <button type="button" onClick={save} disabled={pending} className="text-emerald-600 hover:text-emerald-700">
          <Check className="size-3.5" />
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-neutral-400 hover:text-neutral-600">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-violet-600 transition-colors"
      title={contactName ? "Edit contact name" : "Add a name for this contact"}
    >
      <Pencil className="size-3" />
      {contactName ? "Edit name" : "Add name"}
    </button>
  );
}

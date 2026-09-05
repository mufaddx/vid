"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFooterLinkAction, deleteFooterLinkAction } from "@/server/actions/footer-links";
import { Trash2, Plus } from "lucide-react";

type FooterLink = { id: string; group: "COMPANY" | "PLATFORM" | "GET_STARTED"; label: string; href: string };

const GROUP_LABELS: Record<FooterLink["group"], string> = {
  COMPANY: "Company",
  PLATFORM: "Platform",
  GET_STARTED: "Get Started",
};

// The footer itself only has room for Company / Platform (+ Legal,
// generated from Legal Pages, and Contact) — Get Started links from
// older data aren't deleted, just no longer editable/shown here.
const VISIBLE_GROUPS = ["COMPANY", "PLATFORM"] as const;

export function FooterLinksManager({ links }: { links: FooterLink[] }) {
  const [group, setGroup] = useState<(typeof VISIBLE_GROUPS)[number]>("COMPANY");

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-700">Footer Links</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Manage the Company / Platform link groups shown in the website footer. The Legal group is generated automatically from Legal Pages, and Contact comes from the fields above.
        </p>
      </div>

      {VISIBLE_GROUPS.map((g) => (
        <div key={g} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs font-semibold text-neutral-500 mb-3">{GROUP_LABELS[g].toUpperCase()}</div>
          <div className="space-y-2">
            {links.filter((l) => l.group === g).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 text-sm border-b border-neutral-100 pb-2">
                <div>
                  <span className="font-medium text-neutral-800">{l.label}</span>
                  <span className="text-neutral-400 ml-2">{l.href}</span>
                </div>
                <form action={deleteFooterLinkAction.bind(null, l.id)}>
                  <Button type="submit" variant="ghost" size="icon-sm">
                    <Trash2 className="size-3.5 text-neutral-400" />
                  </Button>
                </form>
              </div>
            ))}
            {links.filter((l) => l.group === g).length === 0 ? (
              <p className="text-sm text-neutral-400">No links yet.</p>
            ) : null}
          </div>
        </div>
      ))}

      <form action={createFooterLinkAction} className="rounded-xl border border-dashed border-neutral-300 p-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
        <input type="hidden" name="group" value={group} />
        <div className="space-y-1">
          <Label className="text-xs">Group</Label>
          <Select value={group} onValueChange={(v) => setGroup(v as (typeof VISIBLE_GROUPS)[number])}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VISIBLE_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>{GROUP_LABELS[g]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Label</Label>
          <Input name="label" required className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL / Path</Label>
          <Input name="href" required placeholder="/page-path" className="h-9" />
        </div>
        <Button type="submit" size="sm"><Plus className="size-4" /> Add</Button>
      </form>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Search, X } from "lucide-react";

type Creator = { id: string; name: string; profileImage: string | null };

// A search + checkbox-list multi-select — built from existing Popover/
// Input/Checkbox/Badge primitives rather than a new combobox dependency,
// since none exists in the codebase and this is the only place it's
// needed. Renders hidden inputs so the selection travels with a normal
// <form action={...}> submission alongside every other field.
export function ManagedCreatorsPicker({
  name,
  creators,
  defaultSelected = [],
}: {
  name: string;
  creators: Creator[];
  defaultSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return creators;
    return creators.filter((c) => c.name.toLowerCase().includes(q));
  }, [creators, query]);

  const selectedCreators = creators.filter((c) => selected.includes(c.id));

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-2">
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between font-normal">
            {selected.length === 0 ? "No creators assigned — unrestricted" : `${selected.length} creator${selected.length === 1 ? "" : "s"} selected`}
            <ChevronDown className="size-4 text-neutral-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b border-neutral-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400" />
              <Input
                placeholder="Search creators…"
                className="pl-8 h-8 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">No creators match.</p>
            ) : (
              filtered.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-neutral-50 cursor-pointer text-sm"
                >
                  <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggle(c.id)} />
                  <Avatar className="size-6">
                    <AvatarImage src={c.profileImage ?? undefined} />
                    <AvatarFallback className="text-[10px]">{c.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{c.name}</span>
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {selectedCreators.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedCreators.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1 pr-1">
              {c.name}
              <button type="button" onClick={() => toggle(c.id)} className="rounded-full hover:bg-black/10 p-0.5">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400">
          Leave empty for unrestricted access to all creators (within their role&rsquo;s permissions).
        </p>
      )}
    </div>
  );
}

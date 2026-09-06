"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Eye, Mail, Phone, Globe } from "lucide-react";
import { markInquiryViewedAction } from "@/server/actions/inquiries";
import { timeAgo } from "@/lib/format";

// Raw form field names (camelCase, as submitted) -> a readable label.
// Anything not listed here still renders — just title-cased from its key.
const LABELS: Record<string, string> = {
  fullName: "Full Name",
  contactPerson: "Contact Person",
  email: "Email",
  phone: "Phone",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  location: "Location",
  category: "Category",
  currentAudience: "Current Audience",
  portfolio: "Portfolio",
  bio: "Bio",
  reason: "Why VIDLIX",
  brandName: "Brand Name",
  website: "Website",
  campaignName: "Campaign Name",
  campaignDescription: "Campaign Description",
  campaignType: "Campaign Type",
  budget: "Budget",
  startDate: "Start Date",
  endDate: "End Date",
  additionalRequirements: "Additional Requirements",
};

function titleCase(key: string): string {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

// These are already shown prominently at the top of the dialog — don't
// repeat them a second time in the raw-payload dump below.
const SHOWN_SEPARATELY = new Set(["fullName", "contactPerson", "email", "phone", "brandName", "website"]);

type Inquiry = {
  id: string;
  type: string;
  status: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  brandName: string | null;
  website: string | null;
  message: string | null;
  payload: unknown;
  createdAt: string | Date;
  viewedAt: string | Date | null;
};

export function InquiryDetailDialog({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false);
  const payload = (inquiry.payload && typeof inquiry.payload === "object" ? inquiry.payload : {}) as Record<string, string>;
  const extraFields = Object.entries(payload).filter(([k, v]) => !SHOWN_SEPARATELY.has(k) && v);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          if (!inquiry.viewedAt) void markInquiryViewedAction(inquiry.id);
        }}
      >
        <Eye className="size-3.5" /> View
      </Button>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {inquiry.brandName || inquiry.fullName || "Inquiry"}
            <StatusBadge status={inquiry.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-neutral-400">
            Submitted {timeAgo(inquiry.createdAt)}
            {inquiry.viewedAt ? " · Viewed" : " · Not yet viewed"}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2 text-sm">
            {inquiry.fullName ? <div className="font-medium text-neutral-900">{inquiry.fullName}</div> : null}
            {inquiry.email ? (
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="size-3.5 text-neutral-400" /> {inquiry.email}
              </div>
            ) : null}
            {inquiry.phone ? (
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="size-3.5 text-neutral-400" /> {inquiry.phone}
              </div>
            ) : null}
            {inquiry.website ? (
              <div className="flex items-center gap-2 text-neutral-600">
                <Globe className="size-3.5 text-neutral-400" /> {inquiry.website}
              </div>
            ) : null}
          </div>

          {extraFields.length > 0 ? (
            <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              {extraFields.map(([key, value]) => (
                <div key={key} className="px-4 py-2.5 text-sm">
                  <div className="text-xs text-neutral-400">{titleCase(key)}</div>
                  <div className="text-neutral-800 whitespace-pre-wrap">{value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

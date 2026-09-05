"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatusAction } from "@/server/actions/inquiries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  "NEW",
  "UNDER_REVIEW",
  "CONTACTED",
  "QUALIFIED",
  "APPROVED",
  "REJECTED",
  "ONBOARDED",
  "CONVERTED",
  "CLOSED",
];

export function InquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        const fd = new FormData();
        fd.set("status", value);
        startTransition(async () => {
          await updateInquiryStatusAction(id, fd);
          router.refresh();
        });
      }}
    >
      <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

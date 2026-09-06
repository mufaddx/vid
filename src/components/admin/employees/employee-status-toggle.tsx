"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEmployeeActiveAction } from "@/server/actions/employees";
import { Button } from "@/components/ui/button";

export function EmployeeStatusToggle({
  employeeId,
  active,
  isSelf,
}: {
  employeeId: string;
  active: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (isSelf) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setEmployeeActiveAction(employeeId, !active);
          router.refresh();
        })
      }
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}

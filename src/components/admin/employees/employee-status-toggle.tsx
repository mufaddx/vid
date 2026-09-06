"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEmployeeActiveAction } from "@/server/actions/employees";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function EmployeeStatusToggle({
  employeeId,
  employeeName,
  active,
  isSelf,
}: {
  employeeId: string;
  employeeName: string;
  active: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (isSelf) return null;

  function toggle() {
    startTransition(async () => {
      await setEmployeeActiveAction(employeeId, !active);
      router.refresh();
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={pending}>
          {pending ? "…" : active ? "Deactivate" : "Activate"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{active ? "Deactivate" : "Activate"} {employeeName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {active
              ? `${employeeName} will immediately lose access to the admin panel and be signed out of any active session.`
              : `${employeeName} will regain access to the admin panel with their existing role and permissions.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={toggle} variant={active ? "destructive" : "default"}>
            {active ? "Deactivate" : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

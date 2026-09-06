"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const ROLES = ["SUPER_ADMIN", "TALENT_MANAGER", "CAMPAIGN_MANAGER", "FINANCE_MANAGER", "INBOX_MANAGER", "VIEWER"] as const;

const employeeSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().optional(),
  designation: z.string().optional(),
  role: z.enum(ROLES),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type EmployeeFormState = { error?: string; ok?: true } | undefined;

/** Only a SUPER_ADMIN may add staff accounts or grant roles — enforced
 * here in addition to the module-level RBAC (see src/lib/permissions.ts)
 * since role assignment itself is more sensitive than most module access. */
export async function createEmployeeAction(
  _prev: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") {
    return { error: "Only Super Admins can add employees." };
  }

  const parsed = employeeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: `${data.email} is already registered.` };
  }

  const passwordHash = await hashPassword(data.password);

  const employee = await prisma.adminUser.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      designation: data.designation || undefined,
      role: data.role,
      passwordHash,
    },
  });

  await logActivity({
    actorId: session.id,
    action: `Employee ${employee.name} added (${employee.role})`,
    entityType: "AdminUser",
    entityId: employee.id,
  });

  revalidatePath("/admin/employees");
  return { ok: true };
}

export async function setEmployeeActiveAction(employeeId: string, active: boolean): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "SUPER_ADMIN") throw new Error("Only Super Admins can change employee access.");
  if (employeeId === session.id) throw new Error("You cannot deactivate your own account.");

  const employee = await prisma.adminUser.update({ where: { id: employeeId }, data: { active } });

  await logActivity({
    actorId: session.id,
    action: `Employee ${employee.name} ${active ? "activated" : "deactivated"}`,
    entityType: "AdminUser",
    entityId: employee.id,
  });

  revalidatePath("/admin/employees");
}

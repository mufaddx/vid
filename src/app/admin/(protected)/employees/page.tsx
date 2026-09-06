import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddEmployeeDialog } from "@/components/admin/employees/add-employee-dialog";
import { EditEmployeeDialog } from "@/components/admin/employees/edit-employee-dialog";
import { EmployeeStatusToggle } from "@/components/admin/employees/employee-status-toggle";
import { formatDate } from "@/lib/format";
import { UserCog } from "lucide-react";

export default async function EmployeesPage() {
  const [employees, creators, managedRows, session] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.creator.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, profileImage: true } }),
    prisma.employeeManagedCreator.findMany({ select: { adminUserId: true, creatorId: true } }),
    getSession(),
  ]);

  const managedByEmployee = new Map<string, string[]>();
  for (const row of managedRows) {
    const list = managedByEmployee.get(row.adminUserId) ?? [];
    list.push(row.creatorId);
    managedByEmployee.set(row.adminUserId, list);
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description={`${employees.length} admin panel user${employees.length === 1 ? "" : "s"}`}
        actions={<AddEmployeeDialog creators={creators} />}
      />
      <div className="p-8">
        {employees.length === 0 ? (
          <EmptyState icon={UserCog} title="No employees yet" action={<AddEmployeeDialog creators={creators} />} />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Managed Creators</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => {
                  const assigned = managedByEmployee.get(e.id) ?? [];
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-neutral-600">{e.email}</TableCell>
                      <TableCell className="text-neutral-600">{e.designation ?? "—"}</TableCell>
                      <TableCell className="text-xs text-neutral-500">{e.role.replaceAll("_", " ")}</TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {["TALENT_MANAGER", "CAMPAIGN_MANAGER"].includes(e.role)
                          ? assigned.length > 0
                            ? `${assigned.length} assigned`
                            : "All (unrestricted)"
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">{e.lastLoginAt ? formatDate(e.lastLoginAt) : "Never"}</TableCell>
                      <TableCell><StatusBadge status={e.active ? "ACTIVE" : "INACTIVE"} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditEmployeeDialog employee={e} creators={creators} managedCreatorIds={assigned} />
                          <EmployeeStatusToggle employeeId={e.id} employeeName={e.name} active={e.active} isSelf={e.id === session?.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

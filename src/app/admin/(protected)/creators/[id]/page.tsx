import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SocialPanel } from "@/components/admin/creator/social-panel";
import { FinancialSummary } from "@/components/admin/creator/financial-summary";
import { EmailPanel } from "@/components/admin/creator/email-panel";
import { markPayoutPaidAction } from "@/server/actions/billing";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber, formatDate, formatINR, timeAgo } from "@/lib/format";
import { FileSignature, Receipt, Mail, FolderOpen, Activity as ActivityIcon, Handshake } from "lucide-react";

export default async function CreatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const creator = await prisma.creator.findUnique({
    where: { id },
    include: {
      socialAccounts: { include: { metric: true } },
      emailAccounts: true,
    },
  });
  if (!creator) notFound();

  const [agreements, invoices, payouts, collaborations, documents, activityLogs] = await Promise.all([
    prisma.agreement.findMany({ where: { creatorId: id }, include: { brand: true, campaign: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ where: { creatorId: id }, include: { brand: true, campaign: true }, orderBy: { createdAt: "desc" } }),
    prisma.payout.findMany({ where: { creatorId: id }, include: { campaign: true }, orderBy: { createdAt: "desc" } }),
    prisma.collaborationCreator.findMany({ where: { creatorId: id }, include: { collaboration: { include: { brand: true, campaign: true } } } }),
    prisma.document.findMany({ where: { creatorId: id }, orderBy: { createdAt: "desc" } }),
    prisma.activityLog.findMany({ where: { creatorId: id }, orderBy: { createdAt: "desc" }, take: 25 }),
  ]);

  const totalAudience = computeTotalAudience(creator.socialAccounts);
  const totalBrandRevenue = invoices.filter((i) => i.invoiceType === "BRAND_CAMPAIGN").reduce((s, i) => s + Number(i.total), 0);
  const vidlixCommission = payouts.reduce((s, p) => s + Number(p.commissionAmount), 0);
  const creatorEarnings = payouts.reduce((s, p) => s + Number(p.creatorAmount), 0);
  const paid = payouts.reduce((s, p) => s + Number(p.paidAmount), 0);
  const pendingPayout = payouts.reduce((s, p) => s + Number(p.pendingAmount), 0);
  const outstandingInvoice = invoices
    .filter((i) => i.invoiceType === "CREATOR_MANAGEMENT" && i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((s, i) => s + Number(i.pendingAmount), 0);

  return (
    <div>
      <Tabs defaultValue="overview">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 border-b border-violet-100 px-8 pt-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 ring-2 ring-violet-100">
                <AvatarImage src={creator.profileImage ?? undefined} />
                <AvatarFallback className="text-lg bg-violet-50 text-violet-700">{creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-neutral-900">{creator.name}</h1>
                  <StatusBadge status={creator.status} />
                  {creator.featured ? <StatusBadge status="ACTIVE" /> : null}
                </div>
                <div className="text-sm text-neutral-500 mt-0.5">
                  {creator.category ?? "Uncategorized"} · {creator.city ?? "—"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={`/admin/creators/${id}/edit`}>Edit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/agreements/new?creatorId=${id}`}>
                  <FileSignature className="size-4" /> Create Agreement
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/billing/invoices/new?creatorId=${id}`}>
                  <Receipt className="size-4" /> Create Invoice
                </Link>
              </Button>
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-8">

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 md:col-span-1">
                <div className="text-xs font-medium text-violet-700">Total Audience</div>
                <div className="text-3xl font-bold text-violet-900 mt-1">{formatCompactNumber(totalAudience)}</div>
              </div>
              <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-white p-5">
                <div className="text-xs font-medium text-neutral-500 mb-2">About</div>
                <p className="text-sm text-neutral-700">{creator.bio ?? "No bio yet."}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Financial Summary</h3>
              <FinancialSummary
                managementFee={Number(creator.managementFee ?? 0)}
                totalBrandRevenue={totalBrandRevenue}
                vidlixCommission={vidlixCommission}
                creatorEarnings={creatorEarnings}
                paid={paid}
                pendingPayout={pendingPayout}
                outstandingInvoice={outstandingInvoice}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Collaborations</h3>
              {collaborations.length === 0 ? (
                <EmptyState icon={Handshake} title="No collaborations yet" />
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                  {collaborations.map((cc) => (
                    <div key={cc.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <div>
                        <span className="font-medium text-neutral-900">{cc.collaboration.brand.name}</span>
                        {cc.collaboration.campaign ? <span className="text-neutral-400"> · {cc.collaboration.campaign.name}</span> : null}
                      </div>
                      <StatusBadge status={cc.collaboration.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="social">
            <SocialPanel creatorId={id} accounts={creator.socialAccounts} />
          </TabsContent>

          <TabsContent value="agreements" className="space-y-4">
            <div className="flex justify-end">
              <Button asChild size="sm">
                <Link href={`/admin/agreements/new?creatorId=${id}`}>New Agreement</Link>
              </Button>
            </div>
            {agreements.length === 0 ? (
              <EmptyState icon={FileSignature} title="No agreements yet" />
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agreement</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.agreementNumber}</TableCell>
                        <TableCell className="text-neutral-600">{a.type.replaceAll("_", " ")}</TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                        <TableCell className="text-neutral-500 text-xs">{formatDate(a.startDate)} – {formatDate(a.endDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/agreements/${a.id}`}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-700">Invoices</h3>
                <Button asChild size="sm">
                  <Link href={`/admin/billing/invoices/new?creatorId=${id}`}>New Invoice</Link>
                </Button>
              </div>
              {invoices.length === 0 ? (
                <EmptyState icon={Receipt} title="No invoices yet" />
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                          <TableCell className="text-neutral-600">{inv.invoiceType.replaceAll("_", " ")}</TableCell>
                          <TableCell>{formatINR(inv.total)}</TableCell>
                          <TableCell>{formatINR(inv.pendingAmount)}</TableCell>
                          <TableCell><StatusBadge status={inv.status} /></TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/billing/invoices/${inv.id}`}>Open</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-700">Payouts</h3>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/billing/payouts/new?creatorId=${id}`}>New Payout</Link>
                </Button>
              </div>
              {payouts.length === 0 ? (
                <EmptyState icon={Receipt} title="No payouts yet" />
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payout</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Creator Share</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.payoutNumber}</TableCell>
                          <TableCell className="text-neutral-600">{p.campaign?.name ?? "—"}</TableCell>
                          <TableCell>{formatINR(p.grossAmount)}</TableCell>
                          <TableCell>{formatINR(p.commissionAmount)} ({Number(p.commissionPercentage)}%)</TableCell>
                          <TableCell className="font-medium">{formatINR(p.netPayable)}</TableCell>
                          <TableCell><StatusBadge status={p.status} /></TableCell>
                          <TableCell className="text-right">
                            {p.status !== "PAID" ? (
                              <form action={markPayoutPaidAction.bind(null, p.id)}>
                                <Button size="sm" variant="outline">Mark Paid</Button>
                              </form>
                            ) : p.statementPdfAssetId ? (
                              <Button asChild variant="ghost" size="sm">
                                <a href={`/api/files/${p.statementPdfAssetId}`} target="_blank">Statement</a>
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="email">
            <EmailPanel creatorId={id} accounts={creator.emailAccounts} />
          </TabsContent>

          <TabsContent value="documents">
            {documents.length === 0 ? (
              <EmptyState icon={FolderOpen} title="No documents yet" />
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="size-4 text-neutral-400" />
                      <span>{d.title}</span>
                      <StatusBadge status={d.category} />
                    </div>
                    <a href={`/api/files/${d.assetId}`} target="_blank" className="text-violet-600 text-xs hover:underline">
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity">
            {activityLogs.length === 0 ? (
              <EmptyState icon={ActivityIcon} title="No activity recorded yet" />
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>{log.action}</span>
                    <span className="text-xs text-neutral-400">{timeAgo(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

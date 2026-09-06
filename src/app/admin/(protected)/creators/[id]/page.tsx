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
import { PhotoCropDialog } from "@/components/admin/creator/photo-crop-dialog";
import { markPayoutPaidAction } from "@/server/actions/billing";
import { computeTotalAudience } from "@/lib/audience";
import { formatCompactNumber, formatDate, formatINR, timeAgo } from "@/lib/format";
import {
  FileSignature,
  Receipt,
  Mail,
  FolderOpen,
  Activity as ActivityIcon,
  Handshake,
  Users,
  Radio,
  Percent,
  CalendarClock,
  MapPin,
  Tag,
  Building2,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getManagedCreatorIds } from "@/lib/creator-scope";

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

  // Closes the direct-URL bypass: the list page above already filters by
  // assigned creators, but a manager-role employee could otherwise still
  // open any creator's detail page by guessing/pasting its id.
  const session = await getSession();
  if (session) {
    const scope = await getManagedCreatorIds(session);
    if (scope !== "ALL" && !scope.includes(id)) notFound();
  }

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
        <div className="sticky top-0 z-20 bg-gradient-to-b from-violet-50/70 via-white/95 to-white/95 backdrop-blur supports-[backdrop-filter]:from-violet-50/60 border-b border-violet-100 px-8 pt-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="size-20 ring-4 ring-white shadow-md shadow-violet-200/50">
                  <AvatarImage src={creator.profileImage ?? undefined} />
                  <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-violet-100 to-violet-50 text-violet-700">
                    {creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <PhotoCropDialog creatorId={id} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{creator.name}</h1>
                  <StatusBadge status={creator.status} />
                  {creator.featured ? <StatusBadge status="ACTIVE" /> : null}
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1.5">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="size-3.5 text-neutral-400" />
                    {creator.category ?? "Uncategorized"}
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-neutral-400" />
                    {creator.city ?? "—"}
                  </span>
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
              <Button asChild className="shadow-sm shadow-violet-300/40">
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

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-600 to-violet-500 p-4 text-white shadow-sm shadow-violet-300/40">
                <div className="inline-flex items-center justify-center size-8 rounded-lg bg-white/15 mb-3">
                  <Users className="size-4" />
                </div>
                <div className="text-xs text-violet-100 leading-tight mb-1">Total Audience</div>
                <div className="text-lg font-bold tracking-tight">{formatCompactNumber(totalAudience)}</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm hover:border-neutral-300 transition-all">
                <div className="inline-flex items-center justify-center size-8 rounded-lg bg-sky-50 mb-3">
                  <Radio className="size-4 text-sky-600" />
                </div>
                <div className="text-xs text-neutral-500 leading-tight mb-1">Connected Platforms</div>
                <div className="text-lg font-bold tracking-tight text-neutral-900">{creator.socialAccounts.length}</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm hover:border-neutral-300 transition-all">
                <div className="inline-flex items-center justify-center size-8 rounded-lg bg-emerald-50 mb-3">
                  <Percent className="size-4 text-emerald-600" />
                </div>
                <div className="text-xs text-neutral-500 leading-tight mb-1">Commission Rate</div>
                <div className="text-lg font-bold tracking-tight text-neutral-900">{Number(creator.commissionPercentage ?? 0)}%</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm hover:border-neutral-300 transition-all">
                <div className="inline-flex items-center justify-center size-8 rounded-lg bg-amber-50 mb-3">
                  <CalendarClock className="size-4 text-amber-600" />
                </div>
                <div className="text-xs text-neutral-500 leading-tight mb-1">Creator Since</div>
                <div className="text-lg font-bold tracking-tight text-neutral-900">{creator.journeyStartYear ?? "—"}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">About</div>
              <p className="text-sm text-neutral-700 leading-relaxed">{creator.bio ?? "No bio yet."}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Financial Summary</h3>
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
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Collaborations</h3>
              {collaborations.length === 0 ? (
                <EmptyState icon={Handshake} title="No collaborations yet" />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {collaborations.map((cc) => (
                    <div
                      key={cc.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 hover:shadow-sm hover:border-neutral-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center size-9 rounded-xl bg-violet-50 text-violet-700 font-semibold text-xs shrink-0">
                          {cc.collaboration.brand.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-900 truncate">{cc.collaboration.brand.name}</div>
                          {cc.collaboration.campaign ? (
                            <div className="text-xs text-neutral-400 flex items-center gap-1 truncate">
                              <Building2 className="size-3 shrink-0" />
                              {cc.collaboration.campaign.name}
                            </div>
                          ) : null}
                        </div>
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

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/format";
import { Contact, Mail, Phone } from "lucide-react";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { InquiryDetailDialog } from "@/components/admin/inquiries/inquiry-detail-dialog";
import { cn } from "@/lib/utils";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  const creatorInquiries = inquiries.filter((i) => i.type === "CREATOR");
  const brandInquiries = inquiries.filter((i) => i.type === "BRAND");
  const collabInquiries = inquiries.filter((i) => i.type === "COLLABORATION");

  return (
    <div>
      <PageHeader title="Inquiries" description="Creator applications and brand collaboration requests" />
      <div className="p-8">
        <Tabs defaultValue="creator">
          <TabsList>
            <TabsTrigger value="creator">Creator ({creatorInquiries.length})</TabsTrigger>
            <TabsTrigger value="brand">Brand ({brandInquiries.length})</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration ({collabInquiries.length})</TabsTrigger>
          </TabsList>
          {[
            { value: "creator", items: creatorInquiries },
            { value: "brand", items: brandInquiries },
            { value: "collaboration", items: collabInquiries },
          ].map((group) => (
            <TabsContent key={group.value} value={group.value} className="pt-6">
              {group.items.length === 0 ? (
                <EmptyState icon={Contact} title="No inquiries yet" />
              ) : (
                <div className="grid gap-3">
                  {group.items.map((i) => {
                    const name = i.brandName || i.fullName || "Unknown";
                    return (
                      <div
                        key={i.id}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-2xl border bg-white p-4 transition-shadow",
                          i.viewedAt ? "border-neutral-200" : "border-violet-200 shadow-sm shadow-violet-100/60",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center size-10 rounded-xl bg-violet-50 text-violet-700 font-semibold text-sm shrink-0">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900 truncate">{name}</span>
                              {!i.viewedAt ? (
                                <span className="inline-flex items-center rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shrink-0">
                                  NEW
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                              {i.email ? (
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Mail className="size-3 shrink-0" /> {i.email}
                                </span>
                              ) : null}
                              {i.phone ? (
                                <span className="inline-flex items-center gap-1 shrink-0">
                                  <Phone className="size-3" /> {i.phone}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-neutral-400">{timeAgo(i.createdAt)}</span>
                          <InquiryDetailDialog
                            inquiry={{
                              id: i.id,
                              type: i.type,
                              status: i.status,
                              fullName: i.fullName,
                              email: i.email,
                              phone: i.phone,
                              brandName: i.brandName,
                              website: i.website,
                              message: i.message,
                              payload: i.payload,
                              createdAt: i.createdAt,
                              viewedAt: i.viewedAt,
                            }}
                          />
                          <InquiryStatusSelect id={i.id} status={i.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

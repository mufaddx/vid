import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/format";
import { Contact } from "lucide-react";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";

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
                <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
                  {group.items.map((i) => (
                    <div key={i.id} className="flex items-center justify-between px-5 py-4 text-sm">
                      <div>
                        <div className="font-medium text-neutral-900">{i.brandName || i.fullName}</div>
                        <div className="text-xs text-neutral-400">{i.email} · {i.phone}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400">{timeAgo(i.createdAt)}</span>
                        <InquiryStatusSelect id={i.id} status={i.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

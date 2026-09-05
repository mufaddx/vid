import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { formatDate } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export default async function AdminLegalPage() {
  const pages = await prisma.legalPage.findMany({ orderBy: { title: "asc" } });

  return (
    <div>
      <PageHeader title="Legal Pages" description="Edit the content of each published legal document." />
      <div className="p-8">
        <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/admin/legal/${page.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
            >
              <div>
                <div className="font-medium text-neutral-900">{page.title}</div>
                <div className="text-xs text-neutral-400 mt-0.5">/legal/{page.slug} · updated {formatDate(page.updatedAt)}</div>
              </div>
              <ArrowRight className="size-4 text-neutral-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

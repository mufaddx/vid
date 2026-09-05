import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal & Policies | VIDLIX",
  description: "VIDLIX's terms, privacy policy, and other legal and platform policies.",
};

export default async function LegalIndexPage() {
  const pages = await prisma.legalPage.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">LEGAL</div>
      <h1 className="text-3xl sm:text-5xl font-bold mt-4 mb-4 text-balance">Legal &amp; Policies</h1>
      <p className="text-neutral-400 leading-relaxed mb-10">
        The policies below govern use of the VIDLIX website and our creator management and brand collaboration services.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {pages.map((page) => (
          <Link
            key={page.slug}
            href={`/legal/${page.slug}`}
            className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03]"
          >
            <span className="flex items-center gap-3">
              <FileText className="size-4 text-violet-400 shrink-0" />
              <span>{page.title}</span>
            </span>
            <ArrowRight className="size-4 text-neutral-500 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

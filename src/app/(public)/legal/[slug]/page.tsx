import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.legalPage.findUnique({ where: { slug } });
  if (!page) return {};
  return {
    title: `${page.title} | VIDLIX`,
    description: `VIDLIX's ${page.title}.`,
  };
}

export async function generateStaticParams() {
  const pages = await prisma.legalPage.findMany({ select: { slug: true } });
  return pages.map((p) => ({ slug: p.slug }));
}

export default async function LegalPageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div className="text-white max-w-3xl mx-auto px-6 py-20">
      <Link href="/legal" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="size-3.5" /> All Policies
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-balance">{page.title}</h1>
      <p className="text-xs text-neutral-500 mb-10">Last updated {formatDate(page.updatedAt)}</p>
      <div
        className="legal-content text-neutral-300 leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-violet-400 [&_a]:hover:text-violet-300 [&_strong]:text-neutral-200"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}

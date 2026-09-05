import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title: `${title} | VIDLIX Blog`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, include: { category: true } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const related = post.categoryId
    ? await prisma.blogPost.findMany({
        where: { status: "PUBLISHED", categoryId: post.categoryId, id: { not: post.id } },
        orderBy: { publishedAt: "desc" },
        take: 3,
      })
    : [];

  return (
    <article className="text-white max-w-3xl mx-auto px-6 py-16 sm:py-20">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="size-3.5" /> All Articles
      </Link>

      {post.category ? (
        <div className="text-[11px] font-medium tracking-widest text-violet-400 mb-3">{post.category.name.toUpperCase()}</div>
      ) : null}
      <h1 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight text-balance">{post.title}</h1>
      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-10 pb-8 border-b border-white/10">
        <span>{post.authorName}</span>
        <span className="text-neutral-700">•</span>
        <span>{formatDate(post.publishedAt)}</span>
        <span className="text-neutral-700">•</span>
        <span className="flex items-center gap-1"><Clock className="size-3.5" /> {post.readingMinutes} min read</span>
      </div>

      <div
        className="blog-content text-neutral-300 leading-relaxed space-y-4 text-[15px] sm:text-base [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-violet-400 [&_a]:hover:text-violet-300 [&_strong]:text-neutral-200"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {related.length > 0 ? (
        <div className="mt-16 pt-10 border-t border-white/10">
          <h2 className="text-lg font-semibold mb-6">Related Articles</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-violet-400/30 hover:bg-white/[0.04]"
              >
                <h3 className="text-sm font-medium leading-snug line-clamp-2">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

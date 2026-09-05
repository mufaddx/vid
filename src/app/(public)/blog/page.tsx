import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | VIDLIX",
  description: "Insights on the creator economy, brand collaborations, and content strategy from the VIDLIX team.",
};

function PostCard({ post }: { post: { slug: string; title: string; excerpt: string; readingMinutes: number; publishedAt: Date | null; category: { name: string } | null } }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:border-violet-400/30 hover:bg-white/[0.04] hover:-translate-y-0.5"
    >
      {post.category ? (
        <div className="text-[11px] font-medium tracking-widest text-violet-400 mb-3">{post.category.name.toUpperCase()}</div>
      ) : null}
      <h3 className="font-semibold text-lg mb-2 leading-snug group-hover:text-violet-300 transition-colors">{post.title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span>{formatDate(post.publishedAt)}</span>
        <span className="text-neutral-700">•</span>
        <span className="flex items-center gap-1"><Clock className="size-3" /> {post.readingMinutes} min read</span>
      </div>
    </Link>
  );
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const featured = !q && !category ? posts.find((p) => p.featured) : undefined;
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div className="text-white max-w-7xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-10">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">INSIGHTS</div>
        <h1 className="text-3xl sm:text-5xl font-bold mt-4 text-balance">The VIDLIX Blog</h1>
        <p className="text-neutral-400 mt-3 max-w-xl mx-auto">
          The creator economy, brand collaborations, and content strategy — from the team running it every day.
        </p>
      </div>

      <form className="max-w-lg mx-auto mb-6">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search articles…"
          className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 h-11"
        />
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        <Link
          href="/blog"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!category ? "border-violet-400/40 bg-violet-500/10 text-violet-300" : "border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/blog?category=${c.slug}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${category === c.slug ? "border-violet-400/40 bg-violet-500/10 text-violet-300" : "border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {featured ? (
        <Link
          href={`/blog/${featured.slug}`}
          className="group block rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/40 to-transparent p-8 sm:p-10 mb-12 transition-all hover:border-violet-400/40"
        >
          <div className="text-[11px] font-medium tracking-widest text-violet-400 mb-3">FEATURED</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug group-hover:text-violet-300 transition-colors text-balance">
            {featured.title}
          </h2>
          <p className="text-neutral-400 leading-relaxed mb-5 max-w-2xl">{featured.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>{formatDate(featured.publishedAt)}</span>
            <span className="text-neutral-700">•</span>
            <span className="flex items-center gap-1"><Clock className="size-3" /> {featured.readingMinutes} min read</span>
          </div>
        </Link>
      ) : null}

      {rest.length === 0 ? (
        <p className="text-center text-neutral-500 py-20">No articles found matching your search.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

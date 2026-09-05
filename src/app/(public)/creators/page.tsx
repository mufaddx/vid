import { prisma } from "@/lib/prisma";
import { CreatorCard } from "@/components/public/creator-card";
import { computeTotalAudience } from "@/lib/audience";
import { Input } from "@/components/ui/input";

export default async function CreatorsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const creators = await prisma.creator.findMany({
    where: {
      status: "ACTIVE",
      // No `mode: "insensitive"` here — that's a Postgres-only Prisma
      // option. MySQL's default utf8mb4 collation (*_ci = case-insensitive)
      // already makes `contains` case-insensitive, so plain `contains`
      // behaves the same way without it.
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
              { city: { contains: q } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    include: { socialAccounts: { include: { metric: true } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  const categories = await prisma.creator.findMany({
    where: { status: "ACTIVE", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="text-white max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <div className="text-[11px] font-medium tracking-[0.3em] text-violet-400">THE ROSTER</div>
        <h1 className="text-3xl sm:text-5xl font-bold mt-4 text-balance">Meet the Creators</h1>
        <p className="text-neutral-400 mt-3 max-w-xl mx-auto">
          Search by creator name, niche, platform or keyword.
        </p>
      </div>

      <form className="max-w-lg mx-auto mb-6">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search creators…"
          className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 h-11"
        />
      </form>

      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <a href="/creators" className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-colors">
            All
          </a>
          {categories.map((c) => (
            <a
              key={c.category}
              href={`/creators?category=${encodeURIComponent(c.category!)}`}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white hover:border-white/25 transition-colors"
            >
              {c.category}
            </a>
          ))}
        </div>
      ) : null}

      {creators.length === 0 ? (
        <p className="text-center text-neutral-500 py-20">No creators found matching your search.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {creators.map((c) => (
            <CreatorCard
              key={c.id}
              creator={{
                slug: c.slug,
                name: c.name,
                category: c.category,
                city: c.city,
                profileImage: c.profileImage,
                totalAudience: computeTotalAudience(c.socialAccounts),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

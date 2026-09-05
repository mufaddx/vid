import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { computeTotalAudience, audienceByPlatform } from "@/lib/audience";
import { formatNumber, formatCompactNumber, timeAgo } from "@/lib/format";
import { Camera, PlayCircle, ThumbsUp, ArrowRight } from "lucide-react";

async function getCreator(slug: string) {
  return prisma.creator.findUnique({
    where: { slug, status: { in: ["ACTIVE", "PENDING"] } },
    include: {
      socialAccounts: { include: { metric: true } },
      journeyEntries: { where: { visible: true }, orderBy: { order: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreator(slug);
  if (!creator) return {};

  const title = `${creator.name} — ${creator.category ?? "Creator"} | VIDLIX`;
  const description =
    creator.bio ??
    `Discover ${creator.name}, a VIDLIX-managed creator with a growing audience.`;

  return {
    title,
    description,
    openGraph: { title, description, images: creator.profileImage ? [creator.profileImage] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

const PLATFORM_META = {
  INSTAGRAM: { icon: Camera, label: "Instagram", unit: "Followers" },
  YOUTUBE: { icon: PlayCircle, label: "YouTube", unit: "Subscribers" },
  FACEBOOK: { icon: ThumbsUp, label: "Facebook", unit: "Followers" },
} as const;

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = await getCreator(slug);
  if (!creator) notFound();

  const totalAudience = computeTotalAudience(creator.socialAccounts);
  const byPlatform = audienceByPlatform(creator.socialAccounts);

  return (
    <div className="text-white">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <Avatar className="size-32 ring-4 ring-white/10">
            <AvatarImage src={creator.profileImage ?? undefined} />
            <AvatarFallback className="text-3xl bg-neutral-800">{creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-bold">{creator.name}</h1>
            <p className="text-neutral-400 mt-1">
              {creator.category ?? "Creator"} · {creator.city ?? creator.country}
              {creator.journeyStartYear ? ` · Since ${creator.journeyStartYear}` : ""}
            </p>
            {creator.bio ? <p className="text-neutral-300 mt-3 max-w-xl">{creator.bio}</p> : null}
          </div>
          <Button asChild size="lg" className="bg-violet-600 text-white hover:bg-violet-500 transition-colors shrink-0">
            <Link href={`/brand-inquiry?creatorId=${creator.id}`}>Collaborate with {creator.name.split(" ")[0]}</Link>
          </Button>
        </div>
      </section>

      {/* Social metrics */}
      <section className="max-w-5xl mx-auto px-6 py-10 grid sm:grid-cols-3 gap-4">
        {creator.socialAccounts.map((account) => {
          const meta = PLATFORM_META[account.platform];
          const Icon = meta.icon;
          const value = account.platform === "YOUTUBE" ? account.metric?.subscribers ?? 0 : account.metric?.followers ?? 0;
          return (
            <div key={account.id} className="rounded-2xl border border-white/10 p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Icon className="size-4" /> {meta.label}
                </div>
              </div>
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              <div className="text-xs text-neutral-500 mt-1">
                @{account.username} · {meta.unit}
              </div>
              <div className="text-xs text-neutral-600 mt-2">
                Updated {account.lastSyncedAt ? timeAgo(account.lastSyncedAt) : "never"}
              </div>
            </div>
          );
        })}
      </section>

      {/* Total audience */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-8 text-sm text-neutral-400">
            <span>Instagram: <span className="text-white font-medium">{formatCompactNumber(byPlatform.INSTAGRAM)}</span></span>
            <span>YouTube: <span className="text-white font-medium">{formatCompactNumber(byPlatform.YOUTUBE)}</span></span>
            <span>Facebook: <span className="text-white font-medium">{formatCompactNumber(byPlatform.FACEBOOK)}</span></span>
          </div>
          <div className="text-right">
            <div className="text-xs text-violet-300 tracking-widest">TOTAL AUDIENCE</div>
            <div className="text-3xl font-bold">{formatCompactNumber(totalAudience)}</div>
          </div>
        </div>
      </section>

      {/* Journey */}
      {creator.journeyEntries.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-semibold mb-8 text-center">Creator Journey</h2>
          <div className="space-y-6">
            {creator.journeyEntries.map((entry) => (
              <div key={entry.id} className="flex gap-6">
                <div className="w-16 shrink-0 text-violet-400 font-bold">{entry.year}</div>
                <div className="border-l border-white/10 pl-6 pb-6">
                  <div className="font-medium">{entry.title}</div>
                  {entry.description ? <p className="text-sm text-neutral-400 mt-1">{entry.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Story */}
      {creator.longBio ? (
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-semibold mb-4">The Story</h2>
          <p className="text-neutral-300 leading-relaxed">{creator.longBio}</p>
        </section>
      ) : null}

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <Button asChild size="lg" className="bg-violet-600 text-white hover:bg-violet-500 transition-colors">
          <Link href={`/brand-inquiry?creatorId=${creator.id}`}>
            Collaborate with {creator.name.split(" ")[0]} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

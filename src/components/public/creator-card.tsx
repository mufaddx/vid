import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCompactNumber } from "@/lib/format";

export type CreatorCardData = {
  slug: string;
  name: string;
  category: string | null;
  city: string | null;
  profileImage: string | null;
  totalAudience: number;
};

export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  return (
    <Link
      href={`/creators/${creator.slug}`}
      className="group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet-400/30 hover:-translate-y-1 transition-all overflow-hidden"
    >
      <div className="aspect-[4/5] bg-neutral-900 relative overflow-hidden">
        {creator.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.profileImage}
            alt={creator.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Avatar className="size-24">
              <AvatarFallback className="text-2xl bg-neutral-800 text-neutral-400">
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="font-semibold">{creator.name}</div>
          <div className="text-xs text-neutral-300">{creator.category ?? "Creator"} · {creator.city ?? "India"}</div>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-neutral-400">Total Audience</span>
        <span className="font-semibold text-white">{formatCompactNumber(creator.totalAudience)}</span>
      </div>
    </Link>
  );
}

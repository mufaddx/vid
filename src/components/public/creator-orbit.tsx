"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type OrbitCreator = {
  slug: string;
  name: string;
  profileImage: string | null;
};

// A slow-rotating ring of creator photos around the VIDLIX mark. Pure CSS
// animation (spec §8) — pauses on hover, each photo links to the creator's
// profile. Kept intentionally simple: a single ring is far more reliable
// across screen sizes than simulating true orbital mechanics.
export function CreatorOrbit({ creators }: { creators: OrbitCreator[] }) {
  const items = creators.slice(0, 8);
  const radius = 42; // percent of container

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-[15%] rounded-full border border-white/5" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-20 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
          <span className="text-white font-bold tracking-widest text-sm">VIDLIX</span>
        </div>
      </div>

      <div className="absolute inset-0 [animation:spin_36s_linear_infinite] hover:[animation-play-state:paused]">
        {items.map((creator, i) => {
          const angle = (2 * Math.PI * i) / items.length;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <Link
              key={creator.slug}
              href={`/creators/${creator.slug}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 [animation:spin-reverse_36s_linear_infinite]"
            >
              <Avatar className="size-14 ring-2 ring-neutral-950 hover:ring-violet-500 transition-all hover:scale-110">
                <AvatarImage src={creator.profileImage ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-white text-xs">
                  {creator.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          );
        })}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
      `}</style>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Segment-level boundary for the public site — catches errors from
// (public)/layout.tsx's own data fetching (already made defensive with
// try/catch, but this is the safety net) and any public page. Styled to
// match the public site's dark theme rather than the admin panel's light
// one, since RootLayout (fonts/CSS) is still intact around this — only
// the .dark theme class needs to be reapplied since it normally comes
// from (public)/layout.tsx, which this boundary replaces.
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="dark min-h-screen flex items-center justify-center px-6 py-24 bg-background text-foreground">
      <div className="max-w-md text-center">
        <div className="text-xs font-medium tracking-[0.3em] text-violet-400 mb-4">VIDLIX</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Something went wrong</h1>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          We hit a temporary problem loading this page. This has been logged — please try again.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()} className="bg-violet-600 text-white hover:bg-violet-500">Try again</Button>
          <Button asChild variant="ghost" className="border border-white/15 text-white bg-white/[0.02] hover:bg-white/10 hover:border-white/25 hover:text-white">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Root-level segment boundary — catches errors thrown by any route not
// covered by a more specific error.tsx (e.g. admin pages). RootLayout
// itself still renders around this (fonts/CSS intact), so a plain
// component is enough here; global-error.tsx is the deeper fallback for
// when even the layout itself throws.
export default function RootError({
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
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-neutral-50">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">Something went wrong</h1>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          We hit a temporary problem loading this page. This has been logged — please try again.
        </p>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}

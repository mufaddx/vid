import Link from "next/link";
import { Button } from "@/components/ui/button";

// No not-found.tsx existed anywhere before — a bad URL fell through to
// Next's bare default 404 (same "unstyled" symptom, different trigger).
export default function NotFound() {
  return (
    <div className="dark min-h-screen flex items-center justify-center px-6 py-24 bg-background text-foreground">
      <div className="max-w-md text-center">
        <div className="text-xs font-medium tracking-[0.3em] text-violet-400 mb-4">VIDLIX</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
        <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}

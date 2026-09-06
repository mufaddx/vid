"use client";

// This is the ONLY boundary Next.js still renders if the root layout
// itself throws (a rendering error, or an unguarded `await prisma...`
// call in a layout/page that isn't caught by a lower error.tsx). Because
// it replaces RootLayout entirely, it must be a full standalone document
// with its own <html>/<body> and the SAME font + globals.css imports —
// otherwise the fallback is Next's bare, unstyled default error page,
// which is exactly the "looks like raw browser HTML" bug this fixes.
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col dark bg-background text-foreground">
        <div className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="max-w-md text-center">
            <div className="text-xs font-medium tracking-[0.3em] text-violet-400 mb-4">VIDLIX</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Something went wrong</h1>
            <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
              We hit a temporary problem loading this page. This has been logged — please try again.
            </p>
            <button
              onClick={() => reset()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-violet-600 px-6 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VidlixWordmark } from "@/components/vidlix-wordmark";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/creators", label: "Creators" },
  { href: "/for-brands", label: "For Brands" },
  { href: "/for-creators", label: "For Creators" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-widest text-white">
          <VidlixWordmark xClassName="text-violet-400" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                pathname === item.href ? "text-white" : "text-neutral-400 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:text-white hover:bg-white/10 transition-colors">
            <Link href="/creator-inquiry">Join VIDLIX</Link>
          </Button>
          <Button asChild className="bg-violet-600 text-white hover:bg-violet-500 transition-colors">
            <Link href="/creators">Find a Creator</Link>
          </Button>
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-white/10 bg-neutral-950 px-6 py-4 space-y-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block text-sm text-neutral-300" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Button asChild variant="ghost" className="flex-1 border border-white/20 text-white hover:text-white hover:bg-white/10">
              <Link href="/creator-inquiry">Join VIDLIX</Link>
            </Button>
            <Button asChild className="flex-1 bg-violet-600 text-white hover:bg-violet-500">
              <Link href="/creators">Find a Creator</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

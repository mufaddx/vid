import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-neutral-950 border-t border-white/10 text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold tracking-widest text-white">VIDLIX</div>
          <p className="text-sm mt-3 max-w-xs">
            Creators, brands & beyond. VIDLIX manages exceptional creators and
            connects them with ambitious brands.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-3">EXPLORE</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/creators" className="hover:text-white">Creators</Link></li>
            <li><Link href="/for-brands" className="hover:text-white">For Brands</Link></li>
            <li><Link href="/for-creators" className="hover:text-white">For Creators</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-3">GET STARTED</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/brand-inquiry" className="hover:text-white">Brand Inquiry</Link></li>
            <li><Link href="/creator-inquiry" className="hover:text-white">Creator Inquiry</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 mb-3">CONTACT</div>
          <ul className="space-y-2 text-sm">
            <li>hello@vidlix.in</li>
            <li>+91 90000 00000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-neutral-600">
        © {new Date().getFullYear()} VIDLIX. All rights reserved.
      </div>
    </footer>
  );
}

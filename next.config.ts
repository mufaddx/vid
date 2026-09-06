import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Dev container is reached via 127.0.0.1 (and the host's LAN address),
  // which Next's dev server treats as cross-origin for HMR by default.
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  // Hostinger's shared-hosting MySQL plan has a low connection cap.
  // Static generation (blog/legal pages via generateStaticParams) was
  // spinning up dozens of parallel build workers, each opening its own
  // Prisma connection — enough simultaneous connections to get the
  // MySQL server to drop them mid-build ("Server has closed the
  // connection", P1017), which fails the ENTIRE production build (a
  // failed build means the previous version stays live — the deploy
  // itself never went out, not a runtime bug). Fewer, retrying workers
  // keeps concurrent DB connections during the build well under the cap.
  experimental: {
    staticGenerationRetryCount: 2,
    staticGenerationMinPagesPerWorker: 50,
  },

  // Hostinger's edge CDN sits in front of the app and was caching HTML
  // page responses. Every deploy renames the hashed JS/CSS chunk files
  // (old ones are removed), so a cached HTML page from before a deploy
  // still references asset URLs that now 404 — which is exactly what an
  // unstyled/broken page on refresh looks like. Static, content-hashed
  // assets are safe to cache forever; every actual page response must
  // never be cached by an intermediate CDN so it always gets the HTML
  // that matches the currently-live build's asset hashes.
  async headers() {
    // Order matters: when multiple entries match the same path, Next.js
    // applies the LAST one for a repeated header key — so the catch-all
    // (no-cache) has to come first, and the static-assets override
    // (immutable, long-lived) second, so it actually wins for those paths.
    return [
      {
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Creator photos — content-addressed by a random asset id, so a
      // given URL's bytes never change; safe (and important, for public
      // site performance) to cache forever, same as the static chunks
      // above. This overrides the catch-all no-store rule for this path
      // specifically — the route handler's own Cache-Control header
      // alone isn't enough because it's applied before this config layer.
      {
        source: "/api/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  // @react-pdf/textkit statically imports "@react-pdf/hyphenate/en-us" to
  // auto-hyphenate wrapped text. That package's package.json "exports"
  // map declares only an "import" condition (no "require", not even for
  // its "./*" wildcard) — a real, unfixed gap in its one and only
  // published version (0.1.0). Depending on how that specifier ends up
  // getting resolved at runtime, that can throw
  // ERR_PACKAGE_PATH_NOT_EXPORTED and take down PDF generation entirely.
  // Aliasing it to a local no-op shim (see src/lib/pdf/hyphenate-en-us-shim.js)
  // sidesteps the broken package's resolution altogether — every PDF in
  // the app is plain-English legal/financial copy that doesn't need
  // automatic mid-word hyphenation anyway. Configured for both: `next dev`
  // runs on Turbopack (its own resolver, own config key) while `next build`
  // runs on webpack (see package.json's "build" script) — without a
  // `turbopack` entry here, Turbopack refuses to start at all as soon as
  // it sees an unrecognized `webpack()` config function present.
  turbopack: {
    resolveAlias: {
      "@react-pdf/hyphenate/en-us": "./src/lib/pdf/hyphenate-en-us-shim.js",
    },
  },
  webpack(config) {
    config.resolve.alias["@react-pdf/hyphenate/en-us"] = path.resolve(
      __dirname,
      "src/lib/pdf/hyphenate-en-us-shim.js",
    );
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Dev container is reached via 127.0.0.1 (and the host's LAN address),
  // which Next's dev server treats as cross-origin for HMR by default.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;

import type { NextConfig } from "next";
import { publicSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  async rewrites() {
    return [
      {
        source: "/workshop",
        destination: "/workshop.html",
      },
      {
        source: "/workshop/selena",
        destination: "/workshop-selena.html",
      },
    ];
  },
  // An unmatched address belongs to neither locale group and so has no root
  // layout; this lets one be declared for it.
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      // The journal and the projects section were two names for one thing.
      {
        source: "/ru/journal",
        destination: "/ru/projects",
        permanent: true,
      },
      {
        source: "/ru/journal/:slug",
        destination: "/ru/projects/:slug",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: publicSecurityHeaders(process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.selenasystems.com"),
      },
    ];
  },
};

export default nextConfig;

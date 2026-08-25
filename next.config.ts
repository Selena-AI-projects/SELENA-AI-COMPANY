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

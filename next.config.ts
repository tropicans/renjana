import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // Creates a minimal production bundle in .next/standalone
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "tailark.com" },
      { protocol: "https", hostname: "html.tailus.io" },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // Creates a minimal production bundle in .next/standalone
  output: "standalone",
};

export default nextConfig;

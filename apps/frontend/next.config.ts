import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: ["bot.merxpos.com", "*.merxpos.com", "localhost:3000"],
    },
  },
};

export default nextConfig;

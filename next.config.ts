import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.charleskeith.in",
      },
      {
        protocol: "https",
        hostname: "michaelkors.scene7.com",
      },
      {
        protocol: "https",
        hostname: "www.michaelkors.global",
      },
      {
        protocol: "https",
        hostname: "**.charleskeith.in",
      },
    ],
  },
};

export default nextConfig;


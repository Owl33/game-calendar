import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**", // 모든 경로 허용
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "**", // 모든 경로 허용
      },
    ],
  },
};

export default nextConfig;

// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ✅ 슬래시로 시작하는 glob 사용
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
        pathname: "/**",
      },
    ],
    // (선택) 기본 deviceSizes에 1200이 포함되어 있어 w=1200은 OK.
    // 혹시 사이즈 커스터마이즈 했다면 1200을 포함하세요.
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

export default nextConfig;

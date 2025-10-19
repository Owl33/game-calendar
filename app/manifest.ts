import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  const name = "릴리즈픽";
  const description =
    "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!";

  return {
    name,
    short_name: name,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B14",
    theme_color: "#6C5CE7",
    lang: "ko-KR",
    scope: "/",
    id: "/",
    orientation: "portrait",
    categories: ["entertainment", "games"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },

    ],
    shortcuts: [
      {
        name: "캘린더",
        short_name: "출시 일정",
        url: "/calendar",
        description: "월별 게임 출시 일정을 확인합니다.",
      },
      {
        name: "전체 게임",
        short_name: "탐색",
        url: "/games",
        description: "장르와 플랫폼 별 게임을 찾아보세요.",
      },
    ],
    screenshots: [
      {
        src: `${getSiteOrigin()}/og-image.png`,
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}

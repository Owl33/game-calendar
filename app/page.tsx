import type { Metadata } from "next";
import HighlightsPage from "./highlights/client";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "릴리즈픽",
  description: "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "릴리즈픽",
    description:
      "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "릴리즈픽",
    description:
      "릴리즈픽에서는 멀티 플랫폼의 게임 발매일과 정보를 한눈에 확인할 수 있습니다. Steam과 Playstaion, Nintendo 등 주요 플랫폼의 신작 출시 정보를 한곳에서 확인하고, 신작을 놓치지 마세요!",
    images: [absoluteUrl("/og-image.png")],
  },
};
export default function RootPage() {
  return <HighlightsPage></HighlightsPage>;
}

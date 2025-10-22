// app/highlights/page.tsx
import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { gameKeys, fetchHighlight } from "@/lib/queries/game";
import HighlightsClient from "./client";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 0; // 최신성 우선 (필요 시 조정)

const HIGHLIGHTS_DESCRIPTION =
  "곧 출시 예정 게임, 인기 타이틀 게임을 릴리즈픽 하이라이트에서 만나보세요.";

export const metadata: Metadata = {
  title: "하이라이트",
  description: HIGHLIGHTS_DESCRIPTION,
  keywords: [
    "게임 하이라이트",
    "인기 게임 추천",
    "곧 출시 예정 게임",
    "인디 게임 추천",
    "게임 큐레이션",
  ],
  alternates: {
    canonical: "/highlights",
  },
  openGraph: {
    title: "게임 하이라이트",
    description: HIGHLIGHTS_DESCRIPTION,
    url: absoluteUrl("/highlights"),
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "게임 하이라이트",
    description: HIGHLIGHTS_DESCRIPTION,
  },
};

const highlightsLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "하이라이트",
  description: HIGHLIGHTS_DESCRIPTION,
  url: absoluteUrl("/highlights"),
  about: ["게임 출시 예정", "인기 게임", "게임 추천"],
};

export default async function Page() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: gameKeys.highlights(),
    queryFn: ({ signal }) => fetchHighlight(signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(highlightsLd),
        }}
      />
      <HighlightsClient />
    </HydrationBoundary>
  );
}

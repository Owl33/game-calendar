// app/highlights/page.tsx
import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { gameKeys, fetchHighlight } from "@/lib/queries/game";
import HighlightsClient from "./client";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 0; // 최신성 우선 (필요 시 조정)

export const metadata: Metadata = {
  title: "게임 하이라이트 : 릴리즈픽",
  description: "곧 출시 예정 게임과 역대 인기 게임을 확인해보세요!",
  alternates: {
    canonical: "/highlights",
  },
  openGraph: {
    title: "게임 하이라이트 : 릴리즈픽",
    description: "곧 출시 예정 게임과 역대 인기 게임을 확인해보세요!",
    url: absoluteUrl("/highlights"),
  },
  twitter: {
    card: "summary",
    title: "게임 하이라이트 : 릴리즈픽",
    description: "곧 출시 예정 게임과 역대 인기 게임을 확인해보세요!",
  },
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
      <HighlightsClient />
    </HydrationBoundary>
  );
}

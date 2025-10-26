// app/games/page.tsx

import type { Metadata } from "next";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import GamesClient from "./client";
import { allGamesKey } from "@/utils/searchParams";
import { fetchAllGamesPage } from "@/lib/queries/game";
import { cookies } from "next/headers"; // ✅ 추가
import { absoluteUrl } from "@/lib/seo";
import { resolveGamesMetadata, stableSerialize, type GamesSearchParams } from "@/lib/filters/games";

export const revalidate = 0;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const { title, description, keywords, canonicalPath } = resolveGamesMetadata(sp);
  const absolute = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: absolute,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GamesSearchParams>;
}) {
  const sp = await searchParams;
  const resetCookie = (await cookies()).get("__games_reset")?.value === "1";

  const { filters, hasFilters, title, canonicalPath } = resolveGamesMetadata(sp);

  const keyStamp = stableSerialize(filters);
  const qk = allGamesKey(filters, keyStamp); // 내부적으로 ["allGames", keyStamp]

  const qc = new QueryClient();
  if (!resetCookie) {
    await qc.prefetchInfiniteQuery({
      queryKey: qk,
      queryFn: fetchAllGamesPage,
      initialPageParam: 1,
      getNextPageParam: (last: any) => {
        const p = last?.pagination;
        return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
      },
    });
  }


  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: hasFilters ? title : "전체 게임 목록",
            description: hasFilters
              ? `${title} - 릴리즈픽`
              : "플랫폼과 장르를 조합해 원하는 게임을 찾을 수 있는 릴리즈픽 전체 게임 목록 페이지입니다.",
            url: absoluteUrl(canonicalPath),
          }),
        }}
      />
      <GamesClient initialFilters={filters} />
    </HydrationBoundary>
  );
}

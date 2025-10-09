import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import GamesClient from "./client";
import { allGamesKey, parseFiltersFromSearchParams } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";
export const revalidate = 0; // 항상 최신 (필요 시 조절)

export default async function GamePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 1) URL → Filter 복원(서버)
  const sp = await searchParams;
  const filters = parseFiltersFromSearchParams(sp);

  // 2) 프리패치 (첫 페이지)
  const qc = new QueryClient();
  const key = allGamesKey(filters, JSON.stringify(filters));

  await qc.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: fetchAllGamesPage, // 동일 fetcher 사용
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const p = lastPage?.pagination;
      if (!p) return undefined;
      return p.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
  });

  // 3) 주입 + 클라 렌더
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <GamesClient initialFilters={filters} />
    </HydrationBoundary>
  );
}

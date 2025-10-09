import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import GamesClient from "./client";
import { parseFiltersFromSearchParams, allGamesKey } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";
import { cookies } from "next/headers"; // ✅ 추가

export const revalidate = 0;

// (동일) canonicalize / stableSerialize 유지
function canonicalize(f: FiltersState): FiltersState {
  const sort = (a?: string[]) => (Array.isArray(a) ? [...a].sort() : []);
  return {
    ...f,
    genres: sort(f.genres),
    tags: sort(f.tags),
    developers: sort(f.developers),
    publishers: sort(f.publishers),
    platforms: sort(f.platforms),
  };
}
function stableSerialize(obj: unknown) {
  if (obj == null) return "null";
  const keys: string[] = [];
  JSON.stringify(obj, (k, v) => (keys.push(k), v));
  keys.sort();
  return JSON.stringify(obj, keys);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const resetCookie = (await cookies()).get("__games_reset")?.value === "1";

  const raw = parseFiltersFromSearchParams(sp);

  const filters: FiltersState = canonicalize(raw);

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
      <GamesClient initialFilters={filters} />
    </HydrationBoundary>
  );
}

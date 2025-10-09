import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import GamesClient from "./client";
import { parseFiltersFromSearchParams, allGamesKey } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";

export const revalidate = 0;
const DBG_ON =
  (typeof window !== "undefined" && window?.localStorage?.getItem("DEBUG") === "games") ||
  typeof window === "undefined"; // 서버는 항상 찍자(필요시 false로)

function dbg(scope: "SRV" | "CLI" | "NET", ...args: any[]) {
  if (!DBG_ON) return;
  const t = (typeof performance !== "undefined" ? performance.now() : Date.now()).toFixed(1);
  // scope: SRV=server, CLI=client, NET=fetch
  // @ts-ignore
  console.log(`[${scope}] [games] t=${t}`, ...args);
}
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
  dbg("SRV", "searchParams(raw)", sp);

  const raw = parseFiltersFromSearchParams(sp);
  dbg("SRV", "filters(parsed)", raw);

  const filters: FiltersState = canonicalize(raw);
  dbg("SRV", "filters(canonical)", filters);

  const keyStamp = stableSerialize(filters);
  const qk = allGamesKey(filters, keyStamp); // 내부적으로 ["allGames", keyStamp]
  dbg("SRV", "queryKey(server)", qk, "keyStamp", keyStamp);

  const qc = new QueryClient();
  dbg("SRV", "prefetch:start");
  await qc.prefetchInfiniteQuery({
    queryKey: qk,
    queryFn: fetchAllGamesPage,
    initialPageParam: 1,
    meta: { filters }, // ← 중요!
    getNextPageParam: (last: any) => {
      const p = last?.pagination;
      return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
  });

  dbg("SRV", "prefetch:done");

  const dehydrated = dehydrate(qc);
  dbg("SRV", "dehydrate:size", {
    queries: dehydrated.queries?.length,
    mutations: dehydrated.mutations?.length,
    keys: dehydrated.queries?.map((q) => q.queryKey),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <GamesClient initialFilters={filters} />
    </HydrationBoundary>
  );
}

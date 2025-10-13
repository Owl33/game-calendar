"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { GameList } from "@/components/games/GameList";
import { FiltersPanel } from "./components/FiltersPanel";
import { allGamesKey } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 서버와 동일 정렬
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

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GamesClient({ initialFilters }: { initialFilters: FiltersState }) {
  const queryClient = useQueryClient();

  // URL 기반 초기 필터(서버와 동일 정렬)
  const initial = useMemo(() => canonicalize(initialFilters), [initialFilters]);

  // 로컬 필터 상태
  const [filters, setFilters] = useState<FiltersState>(initial);
  const debounced = useDebouncedValue(filters, 250);

  // 🔑 현재 필터를 정규화해서 키/메타에 사용
  const normalized = useMemo(() => canonicalize(debounced), [debounced]);
  const keyStamp = useMemo(() => stableSerialize(normalized), [normalized]);
  const queryKey = useMemo(() => allGamesKey(normalized, keyStamp), [normalized, keyStamp]);

  // 서버 프리패치 캐시(동일 키일 때만 사용됨)
  type Page = Awaited<ReturnType<typeof fetchAllGamesPage>>;
  const cached = queryClient.getQueryData<InfiniteData<Page, number>>(queryKey);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<Page, Error, InfiniteData<Page, number>, typeof queryKey, number>({
    queryKey,
    queryFn: fetchAllGamesPage,
    meta: { filters: normalized }, 
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = (last as any)?.pagination;
      return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
    initialData: cached,           // 동일 키면 SSR 캐시 활용
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const flat = useMemo(
    () => data?.pages?.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : [])) ?? [],
    [data]
  );

  // 필터 변경 시 스크롤 상단 이동 (키가 바뀔 때만)
  const prevKeyRef = useRef<string>("");
  useEffect(() => {
    const current = JSON.stringify(queryKey);
    if (prevKeyRef.current && prevKeyRef.current !== current) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    prevKeyRef.current = current;
  }, [queryKey]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (normalized.startDate) params.set("startDate", normalized.startDate);
    if (normalized.endDate) params.set("endDate", normalized.endDate);
    if (normalized.onlyUpcoming) params.set("onlyUpcoming", "true");
    if (normalized.genres?.length) params.set("genres", normalized.genres.join(","));
    if (normalized.tags?.length) params.set("tags", normalized.tags.join(","));
    if (normalized.developers?.length) params.set("developers", normalized.developers.join(","));
    if (normalized.publishers?.length) params.set("publishers", normalized.publishers.join(","));
    if (normalized.platforms?.length) params.set("platforms", normalized.platforms.join(","));
    params.set("popularityScore", String(normalized.popularityScore ?? 40));
    params.set("sortBy", normalized.sortBy ?? "releaseDate");
    params.set("sortOrder", normalized.sortOrder ?? "ASC");
    params.set("pageSize", String(normalized.pageSize ?? 24));
    const next = params.toString();
    const current = typeof window !== "undefined" ? location.search.slice(1) : "";
    if (next !== current) history.replaceState(null, "", `/games?${next}`);
  }, [normalized]);

  // 무한 스크롤
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px", threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, queryKey]); // ✅ 키가 바뀌면 옵저버 갱신

  return (
    <div className="container mx-auto ">
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-3">
          <details className="lg:hidden rounded-xl border border-border/50 bg-card/60 overflow-hidden">
            <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-semibold">필터</span>
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <FiltersPanel
                value={filters}
                onChange={setFilters}
                onResetAll={() => setFilters(initialFilters)}
              />
            </div>
          </details>
          <div className="hidden lg:block sticky top-5 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <FiltersPanel
                value={filters}
                onChange={setFilters}
                onResetAll={() => setFilters(initialFilters)}
              />
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 ">
          <div className="flex items-center flex-wrap justify-between mb-4 lg:mb-3">
            <div className="text-sm flex items-center gap-4"></div>

            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(v: FiltersState["sortBy"]) =>
                  setFilters((f) => ({ ...f, sortBy: v }))
                }
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="releaseDate">출시일</SelectItem>
                  <SelectItem value="popularity">인기도</SelectItem>
                  <SelectItem value="name">이름</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortOrder}
                onValueChange={(v: FiltersState["sortOrder"]) =>
                  setFilters((f) => ({ ...f, sortOrder: v as "ASC" | "DESC" }))
                }
              >
                <SelectTrigger className="w-[110px] h-9">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="DESC">내림차순</SelectItem>
                  <SelectItem value="ASC">오름차순</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(filters.pageSize)}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, pageSize: Math.min(50, Math.max(10, Number(v))) }))
                }
              >
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="페이지" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[10, 12, 18, 20, 24, 30, 40, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}개
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <GameList
            className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}
            games={flat}
            isHeader={false}
            isLoading={isLoading}
          />

          {hasNextPage && (
            <div className="flex justify-center items-center py-8">
              <div ref={loadMoreRef} className="h-1 w-full" />
              {isFetchingNextPage && (
                <div className="text-sm text-muted-foreground">로딩 중...</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

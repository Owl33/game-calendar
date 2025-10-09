"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { motion } from "motion/react";
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
  const router = useRouter();
  const queryClient = useQueryClient();

  // URL 기반 초기 필터(서버와 동일 정렬)
  const initial = useMemo(() => canonicalize(initialFilters), [initialFilters]);

  useEffect(() => {
    const handler = () => {
      try {
        // /games 경로에만 적용되도록 path=/games
        document.cookie = "__games_reset=1; Max-Age=10; Path=/games; SameSite=Lax";
      } catch {}
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // ⬇️ 새 문서가 뜬 뒤(하이드레이션 직후)에는 쿠키를 바로 지워서 다음 내비게이션에 영향 없게
  useEffect(() => {
    try {
      document.cookie = "__games_reset=; Max-Age=0; Path=/games; SameSite=Lax";
    } catch {}
  }, []);

  // 쿼리키(안정 문자열)
  const keyStamp = useMemo(() => stableSerialize(initial), [initial]);
  const queryKey = useMemo(() => allGamesKey(initial, keyStamp), [initial, keyStamp]);

  // 로컬 필터 상태(키는 initial로 고정)
  const [filters, setFilters] = useState<FiltersState>(initial);
  const debounced = useDebouncedValue(filters, 250);

  // 서버 프리패치 결과
  type Page = Awaited<ReturnType<typeof fetchAllGamesPage>>;
  const cached = queryClient.getQueryData<InfiniteData<Page, number>>(queryKey);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery<
    Page,
    Error,
    InfiniteData<Page, number>,
    typeof queryKey,
    number
  >({
    queryKey,
    queryFn: fetchAllGamesPage,
    meta: { filters: initial },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = (last as any)?.pagination;
      return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
    initialData: cached, // 서버에서 온 dehydrated 캐시 그대로 사용
    placeholderData: (prev) => prev, // 캐시 즉시 사용
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // 평탄화
  const flat = useMemo(
    () => data?.pages?.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : [])) ?? [],
    [data]
  );

  // 필터 변경 시: URL 동기화 후 맨 위로 이동 (뒤로가기는 브라우저가 복원하므로 건드리지 않음)
  const routerRef = useRef(router);
  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced.startDate) params.set("startDate", debounced.startDate);
    if (debounced.endDate) params.set("endDate", debounced.endDate);
    if (debounced.onlyUpcoming) params.set("onlyUpcoming", "true");
    if (debounced.genres?.length) params.set("genres", debounced.genres.join(","));
    if (debounced.tags?.length) params.set("tags", debounced.tags.join(","));
    if (debounced.developers?.length) params.set("developers", debounced.developers.join(","));
    if (debounced.publishers?.length) params.set("publishers", debounced.publishers.join(","));
    if (debounced.platforms?.length) params.set("platforms", debounced.platforms.join(","));
    params.set("popularityScore", String(debounced.popularityScore ?? 40));
    params.set("sortBy", debounced.sortBy ?? "releaseDate");
    params.set("sortOrder", debounced.sortOrder ?? "ASC");
    params.set("pageSize", String(debounced.pageSize ?? 24));

    const next = params.toString();
    const current = typeof window !== "undefined" ? location.search.slice(1) : "";
    if (next === current) return;

    routerRef.current.replace(`/games?${next}`, { scroll: false });
    // URL 반영 직후 Top
    queueMicrotask(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [debounced]);

  // 무한 스크롤(필요 시에만 다음 페이지)
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const ob = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (hit && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );

    ob.observe(el);
    return () => ob.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, queryKey]);

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

        <main className="col-span-12 lg:col-span-9 min-h-[60vh]">
          <div className="flex items-center flex-wrap justify-between mb-4 lg:mb-3">
            <div className="text-sm flex items-center gap-4"></div>

            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(v: FiltersState["sortBy"]) =>
                  setFilters((f) => ({ ...f, sortBy: v }))
                }>
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
                }>
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
                }>
                <SelectTrigger className="w-[100px] h-9">
                  <SelectValue placeholder="페이지" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {[10, 12, 18, 20, 24, 30, 40, 50].map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}>
                      {n}개
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}>
            <GameList
              className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}
              games={flat}
              isHeader={false}
              isLoading={isLoading}
            />
          </motion.div>
          <div
            ref={loadMoreRef}
            className="h-10"
          />
        </main>
      </div>
    </div>
  );
}

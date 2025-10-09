"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { GameList } from "@/components/games/GameList";
import ScrollRestorer from "@/app/games/components/ScrollRestorer";

import type { FiltersState } from "@/types/game.types";
import { gameKeys, fetchAllGamesPage } from "@/lib/queries/game";
import { FiltersPanel } from "./components/FiltersPanel";

// 간단한 디바운스 훅
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

  // 1) 필터 상태(초기값=서버가 파싱해준 값)
  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const debouncedFilters = useDebouncedValue(filters, 250);

  // 2) 쿼리 키: 디바운스된 필터를 직렬화하여 항상 “현재 필터” 기준으로 fetch
  const keyStamp = useMemo(() => JSON.stringify(debouncedFilters), [debouncedFilters]);
  const queryKey = gameKeys.all(debouncedFilters, keyStamp);

  // 3) 데이터 패칭
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchAllGamesPage,
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = last?.pagination;
      return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
    // 뒤로가기 UX
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // 4) 상태 → URL 동기화
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.onlyUpcoming) params.set("onlyUpcoming", "true");
    if (filters.genres.length) params.set("genres", filters.genres.join(","));
    if (filters.tags.length) params.set("tags", filters.tags.join(","));
    if (filters.developers.length) params.set("developers", filters.developers.join(","));
    if (filters.publishers.length) params.set("publishers", filters.publishers.join(","));
    if (filters.platforms.length) params.set("platforms", filters.platforms.join(","));
    params.set("popularityScore", String(filters.popularityScore));
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);
    params.set("pageSize", String(filters.pageSize));

    router.replace(`/games?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // 5) 무한스크롤
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 6) 플랫 데이터
  const flatGames = useMemo(
    () => data?.pages?.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : [])) ?? [],
    [data]
  );
  const ready = flatGames.length > 0;
  const storageKey =
    typeof window !== "undefined" ? `${location.pathname}?${location.search}` : `/games?${keyStamp}`;

  const resetFilters = () =>
    setFilters({
      startDate: "",
      endDate: "",
      onlyUpcoming: false,
      genres: [],
      tags: [],
      developers: [],
      publishers: [],
      platforms: [],
      sortBy: "releaseDate",
      sortOrder: "ASC",
      pageSize: 24,
      popularityScore: 40,
    });

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6">
      <ScrollRestorer storageKey={storageKey} ready={ready} />

      <div className="grid grid-cols-12 gap-4">
        {/* 좌측: 필터 */}
        <aside className="col-span-12 lg:col-span-3">
          <details className="lg:hidden rounded-xl border border-border/50 bg-card/60 overflow-hidden">
            <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-semibold">필터</span>
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <FiltersPanel value={filters} onChange={setFilters} onResetAll={resetFilters} />
            </div>
          </details>
          <div className="hidden lg:block sticky top-5 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <FiltersPanel value={filters} onChange={setFilters} onResetAll={resetFilters} />
            </div>
          </div>
        </aside>

        {/* 우측: 목록 */}
        <main className="col-span-12 lg:col-span-9 min-h-[60vh]">
          <div className="flex items-center flex-wrap justify-between mb-3">
            <div className="text-sm flex items-center gap-4">
              <p className="text-lg font-bold">전체 게임</p>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <GameList
              className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}
              games={flatGames}
              isHeader={false}
              isLoading={isLoading}
            />
          </motion.div>

          {!flatGames.length && !isError && (
            <div className="text-center py-16 text-sm text-muted-foreground">
              조건에 맞는 게임이 없어요.
              <div className="mt-3">
                <button
                  className="inline-flex items-center px-3 h-8 rounded-md border text-xs hover:bg-accent"
                  onClick={resetFilters}
                >
                  전체 필터 초기화
                </button>
              </div>
            </div>
          )}

          <div ref={loadMoreRef} className="h-10" />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              더 불러오는 중…
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

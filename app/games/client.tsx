//app/gaems/client.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Calendar as CalendarIcon, ArrowUpDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiltersPanel } from "./components/FiltersPanel";
import { allGamesKey, parseFiltersFromSearchParams } from "@/utils/searchParams";
import type { FiltersState } from "@/types/game.types";
import { fetchAllGamesPage } from "@/lib/queries/game";
import { Button } from "@/components/ui/button";
import { GameVirtualList } from "@/components/games/GameVirtualList";
import { REVIEW_FILTER_ALL } from "@/utils/reviewScore";
import { canonicalizeFilters, stableSerialize } from "@/lib/filters/games";
import { ModalOverlay } from "@/components/modal/modal-overlay";
import { GameResultsToolbar, type SortOption } from "@/components/games/GameResultsToolbar";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // 🔑 URL을 단일 진실 공급원으로 사용
  // searchParams를 Record로 변환
  const currentParams = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // URL에서 현재 필터 파싱 (서버와 동일한 로직)
  const filters = useMemo(() => {
    const parsed = parseFiltersFromSearchParams(currentParams);
    return canonicalizeFilters(parsed);
  }, [currentParams]);

  // 디바운스된 필터 값 (쿼리 키와 API 호출용)
  const debounced = useDebouncedValue(filters, 250);

  // 🔑 현재 필터를 정규화해서 키/메타에 사용
  const normalized = useMemo(() => canonicalizeFilters(debounced), [debounced]);
  const keyStamp = useMemo(() => stableSerialize(normalized), [normalized]);
  const queryKey = useMemo(() => allGamesKey(normalized, keyStamp), [normalized, keyStamp]);

  // 서버 프리패치 캐시(동일 키일 때만 사용됨)
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
    meta: { filters: normalized },
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const p = (last as any)?.pagination;
      return p?.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
    initialData: cached, // 동일 키면 SSR 캐시 활용
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

  // 필터 업데이트 함수 (URL을 직접 업데이트)
  const updateFilters = (updater: (prev: FiltersState) => FiltersState) => {
    const newFilters = updater(filters);
    const params = new URLSearchParams();

    if (newFilters.startDate) params.set("startDate", newFilters.startDate);
    if (newFilters.endDate) params.set("endDate", newFilters.endDate);
    if (newFilters.onlyUpcoming) params.set("onlyUpcoming", "true");
    if (newFilters.genres?.length) params.set("genres", newFilters.genres.join(","));
    if (newFilters.tags?.length) params.set("tags", newFilters.tags.join(","));
    if (newFilters.developers?.length) params.set("developers", newFilters.developers.join(","));
    if (newFilters.publishers?.length) params.set("publishers", newFilters.publishers.join(","));
    if (newFilters.platforms?.length) params.set("platforms", newFilters.platforms.join(","));
    if (
      !newFilters.reviewScoreDesc?.length ||
      newFilters.reviewScoreDesc.includes(REVIEW_FILTER_ALL)
    ) {
      params.set("reviewScoreDesc", REVIEW_FILTER_ALL);
    } else {
      params.set("reviewScoreDesc", newFilters.reviewScoreDesc.join(","));
    }
    params.set("popularityScore", String(newFilters.popularityScore ?? 40));
    params.set("sortBy", newFilters.sortBy ?? "releaseDate");
    params.set("sortOrder", newFilters.sortOrder ?? "ASC");
    params.set("pageSize", String(newFilters.pageSize ?? 9));

    router.replace(`/games?${params.toString()}`, { scroll: false });
  };

  const sortOptions = useMemo<SortOption<FiltersState["sortBy"]>[]>(
    () => [
      { value: "releaseDate", label: "출시일", icon: CalendarIcon },
      { value: "popularity", label: "인기순", icon: TrendingUp },
      { value: "name", label: "이름순", icon: ArrowUpDown },
    ],
    []
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
          <div className="lg:hidden mb-4">
            <div className="lg:hidden mb-4">
              {/* 트리거 버튼 */}
              <Button
                variant="outline"
                className="w-full justify-center gap-2 h-11"
                onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="w-4 h-4" />
                필터 열기
              </Button>

              {/* 오버레이 */}
              <ModalOverlay
                open={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                title="필터"
                // 기본: variant="centered", size="xl", blur/border/shadow=true
                // 닫힘/열림 애니메이션 기본값 사용
              >
                <div className="overflow-y-auto p-4">
                  <FiltersPanel
                    value={filters}
                    onChange={(newFilters) => updateFilters(() => newFilters)}
                    onResetAll={() => updateFilters(() => initialFilters)}
                  />
                </div>
              </ModalOverlay>
            </div>
          </div>
          <div className="hidden lg:block sticky top-5 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <FiltersPanel
                value={filters}
                onChange={(newFilters) => updateFilters(() => newFilters)}
                onResetAll={() => updateFilters(() => initialFilters)}
              />
            </div>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9 ">
          <GameResultsToolbar
            className="mb-4 lg:mb-3"
            sortBy={filters.sortBy}
            sortOptions={sortOptions}
            onSortChange={(v) => updateFilters((f) => ({ ...f, sortBy: v }))}
            sortOrder={filters.sortOrder}
            onSortOrderChange={(v) => updateFilters((f) => ({ ...f, sortOrder: v }))}
            pageSize={filters.pageSize}
            onPageSizeChange={(size) =>
              updateFilters((f) => ({
                ...f,
                pageSize: Math.min(40, Math.max(9, size)),
              }))
            }
          />

          <GameVirtualList
            className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}
            games={flat}
            pageSize={filters.pageSize}
            isHeader={false}
            isLoading={isLoading}
          />

          {hasNextPage && (
            <div className="flex justify-center items-center py-8">
              <div
                ref={loadMoreRef}
                className="h-1 w-full"
              />
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

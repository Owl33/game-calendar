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
import ScrollRestorer from "./components/ScrollRestorer";

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

  // 네비게이션 타입 확인
  const navType = useMemo(() => {
    try {
      const nav = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      return nav?.[0]?.type ?? "navigate";
    } catch {
      return "navigate";
    }
  }, []);
  const isReload = navType === "reload"; // 새로고침 판단

  // URL 기반 초기 필터(서버와 동일 정렬)
  const initial = useMemo(() => canonicalize(initialFilters), [initialFilters]);

  // 쿼리키(2-튜플, 안정 문자열만)
  const keyStamp = useMemo(() => stableSerialize(initial), [initial]);
  const queryKey = useMemo(() => allGamesKey(initial, keyStamp), [initial, keyStamp]);

  // UI 제어용 로컬 상태(키는 initial로 고정)
  const [filters, setFilters] = useState<FiltersState>(initial);
  const debounced = useDebouncedValue(filters, 250);

  // 스토리지 키
  const storageKey =
    typeof window !== "undefined"
      ? `${location.pathname}?${location.search}`
      : `/games?${keyStamp}`;

  // 무한 스크롤 게이트
  const allowRef = useRef(false);

  // 새로고침 시: 스크롤/페이지 복원 X, Top으로 이동, IO 자동 허용 X(사용자 스크롤 전까지 막음)
  useEffect(() => {
    if (!isReload) return;
    try {
      sessionStorage.removeItem(`pages:${storageKey}`);
      sessionStorage.removeItem(`scroll:${storageKey}`);
    } catch {}
    allowRef.current = false;
    queueMicrotask(() => window.scrollTo({ top: 0, behavior: "auto" }));
  }, [isReload, storageKey]);

  // 뒤로가기/일반 진입 시: 게이트를 사용자가 스크롤하면 열고, 자동으로 열리는 타임아웃(600ms)은 reload가 아닐 때만
  useEffect(() => {
    let y0 = 0;
    const onScroll = () => {
      if (Math.abs(window.scrollY - y0) > 24) {
        allowRef.current = true;
        window.removeEventListener("scroll", onScroll);
      }
    };
    y0 = window.scrollY;
    allowRef.current = false;

    let t: ReturnType<typeof setTimeout> | undefined;
    if (!isReload) {
      t = setTimeout(() => {
        allowRef.current = true;
        window.removeEventListener("scroll", onScroll);
      }, 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [queryKey, isReload]);

  // React Query: 서버 프리패치 결과를 initialData로 즉시 사용
  type Page = Awaited<ReturnType<typeof fetchAllGamesPage>>;
  const cached = queryClient.getQueryData<InfiniteData<Page, number>>(queryKey);
  const seedRef = useRef<InfiniteData<Page, number> | undefined>(cached);
  if (!seedRef.current && cached) seedRef.current = cached;

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
    initialData: cached,
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // 평탄화
  const effective = data ?? seedRef.current;
  const flat = useMemo(
    () => effective?.pages?.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : [])) ?? [],
    [effective]
  );
  const ready = flat.length > 0;

  // URL 동기화(필터 바꿀 때만; 새로고침 시 URL은 그대로 둠)
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
    if (next === current) return; // 동일하면 replace 생략
    routerRef.current.replace(`/games?${next}`, { scroll: false });
  }, [debounced]);

  // (선택) 떠날 때 현재 페이지 수 저장 — 뒤로가기를 위한 정보. 새로고침 초기화엔 영향 없음.
  useEffect(() => {
    const key = `pages:${storageKey}`;
    const pages = effective?.pages?.length ?? 0;
    const save = () => {
      try {
        sessionStorage.setItem(key, String(pages));
      } catch {}
    };
    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);
    return () => {
      save();
      window.removeEventListener("pagehide", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [storageKey, effective]);

  // 새로고침일 때는 catch-up(선행 로딩) 자체를 수행하지 않음
  // 뒤로가기 전용으로 쓰고 싶다면, 아래 이펙트를 추가하되 isReload일 때는 return; 지금 요구에선 제거/미수행이 맞음.

  // 무한스크롤
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const ob = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        // 새로고침이면: 사용자가 실제로 스크롤하기 전까지 allowRef가 열리지 않음 → 자동 로딩 방지
        if (!allowRef.current) return;
        if (hit && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.01,
      }
    );

    ob.observe(el);
    return () => ob.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, queryKey]);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6">
      {/* 새로고침일 때는 복원/저장 비활성화 → 항상 Top */}
      <ScrollRestorer
        storageKey={storageKey}
        ready={ready}
        disabled={isReload}
      />

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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}>
            <GameList
              className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3")}
              games={flat}
              isHeader={false}
              isLoading={isLoading && !cached}
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

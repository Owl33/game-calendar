"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, X, Plus, Minus } from "lucide-react";
import { GameList } from "@/components/games/GameList";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/* ===================== 타입/상수 ===================== */
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type PlatformKey = "pc" | "playstation" | "xbox" | "nintendo";

type CalendarReleaseDto = {
  releaseIds: number[];
  gameId: number;
  name: string;
  slug: string;
  headerImage: string | null;
  platforms: PlatformKey[];
  stores: ("steam" | "psn" | "xbox" | "nintendo")[];
  storeLinks: { store: string; url: string | null }[];
  releaseDate: string | Date;
  releaseDateRaw: string | null;
  comingSoon: boolean;
  releaseStatus: "tba" | "coming_soon" | "early_access" | "released" | "cancelled" | null;
  popularityScore: number;
  genres: string[];
  developers: string[];
  publishers: string[];
  currentPrice: number | null;
};

type AllGamesApiResponse = {
  filters: Record<string, unknown>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  count: { total: number; filtered: number };
  data: CalendarReleaseDto[];
};

const GENRE_OPTIONS = [
  "액션",
  "인디",
  "시뮬레이션",
  "캐주얼",
  "레이싱",
  "무료 플레이",
  "스포츠",
  "전략",
];
const TAG_OPTIONS = [
  "싱글 플레이어",
  "멀티 플레이어",
  "협동",
  "1인칭",
  "3인칭",
  "온라인 협동",
  "PvP",
  "MMO",
];
const PLATFORM_OPTIONS: PlatformKey[] = ["pc", "playstation", "xbox", "nintendo"];

/* ===================== 유틸 ===================== */
const toYmd = (d: Date | string | null | undefined) => {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(+dt)) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
const toggleArray = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

function buildAllGamesUrl(base: string, page: number, f: FiltersState) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(f.pageSize));
  if (f.startDate) params.set("startDate", f.startDate);
  if (f.endDate) params.set("endDate", f.endDate);
  if (f.onlyUpcoming) params.set("onlyUpcoming", "true");
  if (f.genres.length) params.set("genres", f.genres.join(","));
  if (f.tags.length) params.set("tags", f.tags.join(","));
  if (f.developers.length) params.set("developers", f.developers.join(","));
  if (f.publishers.length) params.set("publishers", f.publishers.join(","));
  if (f.platforms.length) params.set("platforms", f.platforms.join(","));
  params.set("popularityScore", String(f.popularityScore));
  params.set("sortBy", f.sortBy);
  params.set("sortOrder", f.sortOrder);
  return `${base}/api/games/all?${params.toString()}`;
}

/* ===================== 필터 상태 ===================== */
type FiltersState = {
  startDate: string;
  endDate: string;
  onlyUpcoming: boolean;
  genres: string[];
  tags: string[];
  developers: string[];
  publishers: string[];
  platforms: PlatformKey[];
  sortBy: "releaseDate" | "popularity" | "name";
  sortOrder: "ASC" | "DESC";
  pageSize: number;
  popularityScore: number; // 40~100 (이상)
};

const defaultFilters: FiltersState = {
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
};

/* ===================== 데이터 패처 ===================== */
async function fetchAllGamesPage(ctx: QueryFunctionContext): Promise<AllGamesApiResponse> {
  const { pageParam, queryKey, signal } = ctx;
  const [, baseUrl, filters] = queryKey as [string, string, FiltersState, string];
  const url = buildAllGamesUrl(baseUrl, pageParam as number, filters);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Failed to fetch games");
  const json = await res.json();
  return (json?.data ?? json) as AllGamesApiResponse;
}

/* ===================== 페이지(Client) ===================== */
export default function GamesClient({
  initialSearchParams,
}: {
  initialSearchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();

  // Server에서 전달받은 searchParams로 초기값 복원 (useSearchParams 사용 X)

  function makeSearchParams(obj: Record<string, string | string[] | undefined>): URLSearchParams {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        sp.append(k, v);
      } else if (Array.isArray(v)) {
        for (const vv of v) sp.append(k, vv);
      }
    }
    return sp;
  }

  const spInit = makeSearchParams(initialSearchParams);

  const csv = (v: string | null) =>
    v
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const get = (k: string, def = "") => spInit.get(k) ?? def;

  const [filters, setFilters] = useState<FiltersState>(() => {
    const startDate = get("startDate", defaultFilters.startDate);
    const endDate = get("endDate", defaultFilters.endDate);
    const onlyUpcoming = get("onlyUpcoming", "") === "true";
    const genres = csv(get("genres", ""));
    const tags = csv(get("tags", ""));
    const developers = csv(get("developers", ""));
    const publishers = csv(get("publishers", ""));
    const platforms = csv(get("platforms", "")) as PlatformKey[];
    const sortBy =
      (get("sortBy", defaultFilters.sortBy) as FiltersState["sortBy"]) || "releaseDate";
    const sortOrder =
      (get("sortOrder", defaultFilters.sortOrder) as FiltersState["sortOrder"]) || "ASC";
    const pageSizeRaw = Number(get("pageSize", String(defaultFilters.pageSize)));
    const pageSize = Math.min(50, Math.max(10, Number.isFinite(pageSizeRaw) ? pageSizeRaw : 24));
    const popRaw = Number(get("popularityScore", String(defaultFilters.popularityScore)));
    const popularityScore = Number.isFinite(popRaw) ? popRaw : 40;

    return {
      startDate,
      endDate,
      onlyUpcoming,
      genres,
      tags,
      developers,
      publishers,
      platforms,
      sortBy,
      sortOrder,
      pageSize,
      popularityScore,
    };
  });

  const debouncedFilters = useDebouncedValue(filters, 300);
  const debouncedFiltersKey = useMemo(() => JSON.stringify(debouncedFilters), [debouncedFilters]);

  // React Query: 무한스크롤
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["allGames", API_BASE_URL!, debouncedFilters, debouncedFiltersKey],
    queryFn: fetchAllGamesPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage?.pagination;
      if (!p) return undefined;
      return p.hasNextPage ? (p.currentPage ?? 1) + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 상태 → URL 동기화 (useSearchParams 대신 직접 구성)
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (filters.startDate) sp.set("startDate", filters.startDate);
      if (filters.endDate) sp.set("endDate", filters.endDate);
      if (filters.onlyUpcoming) sp.set("onlyUpcoming", "true");
      if (filters.genres.length) sp.set("genres", filters.genres.join(","));
      if (filters.tags.length) sp.set("tags", filters.tags.join(","));
      if (filters.developers.length) sp.set("developers", filters.developers.join(","));
      if (filters.publishers.length) sp.set("publishers", filters.publishers.join(","));
      if (filters.platforms.length) sp.set("platforms", filters.platforms.join(","));
      sp.set("popularityScore", String(filters.popularityScore));
      sp.set("sortBy", filters.sortBy);
      sp.set("sortOrder", filters.sortOrder);
      sp.set("pageSize", String(filters.pageSize));

      router.replace(`/games?${sp.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [filters, router]);

  // 무한스크롤 트리거
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const ob = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const flatGames = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const resetFiltersOnly = () => setFilters(defaultFilters);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6">
      <div className="grid grid-cols-12 gap-4">
        {/* 좌측: 필터 */}
        <aside className="col-span-12 lg:col-span-3">
          {/* Mobile toggle */}
          <details className="lg:hidden rounded-xl border border-border/50 bg-card/60 overflow-hidden">
            <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-semibold">필터</span>
            </summary>
            <div className="px-4 pb-4 space-y-4">
              <FiltersPanel
                filters={filters}
                setFilters={setFilters}
                onResetFilters={resetFiltersOnly}
              />
            </div>
          </details>

          {/* Desktop sticky */}
          <div className="hidden lg:block sticky top-5 space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/60 p-4">
              <FiltersPanel
                filters={filters}
                setFilters={setFilters}
                onResetFilters={resetFiltersOnly}
              />
            </div>
          </div>
        </aside>

        {/* 우측: 목록 */}
        <main className="col-span-12 lg:col-span-9 min-h-[60vh]">
          {/* 정렬 바 */}
          <div className="flex items-center flex-wrap justify-between mb-3">
            <div className="text-sm flex items-center gap-4">
              <p className="text-lg font-bold">전체 게임</p>
              {filters.startDate && filters.endDate && (
                <span className="text-muted-foreground">
                  {toYmd(filters.startDate)} ~ {toYmd(filters.endDate)}
                </span>
              )}
              {filters.onlyUpcoming && <Badge className="ml-2">미출시</Badge>}
            </div>

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
                  <SelectItem value="ASC">오름차순</SelectItem>
                  <SelectItem value="DESC">내림차순</SelectItem>
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
              games={flatGames}
              isHeader={false}
              isLoading={isLoading}
            />
          </motion.div>

          {/* 로드 모어 트리거 */}
          <div
            ref={loadMoreRef}
            className="h-10"
          />
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

/* ===================== 보조 UI들 ===================== */
function SectionHeader({
  title,
  onReset,
  disabled,
}: {
  title: string;
  onReset?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold">{title}</div>
      {onReset && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onReset}
          disabled={disabled}>
          초기화
        </Button>
      )}
    </div>
  );
}

function FiltersPanel({
  filters,
  setFilters,
  onResetFilters,
}: {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onResetFilters: () => void;
}) {
  const resetDates = () =>
    setFilters((f) => ({ ...f, startDate: "", endDate: "", onlyUpcoming: false }));
  const resetGenres = () => setFilters((f) => ({ ...f, genres: [] }));
  const resetTags = () => setFilters((f) => ({ ...f, tags: [] }));
  const resetDevelopers = () => setFilters((f) => ({ ...f, developers: [] }));
  const resetPublishers = () => setFilters((f) => ({ ...f, publishers: [] }));

  const [localPopularity, setLocalPopularity] = useState(filters.popularityScore);
  useEffect(() => {
    setLocalPopularity(filters.popularityScore);
  }, [filters.popularityScore]);

  const tokenCommon = { maxHeightClass: "overflow-auto" };

  return (
    <div className="space-y-6 -12">
      {/* 상단 바 (전체 초기화) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h2 className="text-sm font-semibold">필터</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={onResetFilters}>
          전체 초기화
        </Button>
      </div>

      {/* 인기도 */}
      <section className="space-y-2">
        <SectionHeader
          title="인기도"
          onReset={() => setFilters((f) => ({ ...f, popularityScore: 40 }))}
          disabled={filters.popularityScore === 40}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>최소값</span>
            <span className="font-medium text-foreground">{localPopularity}+</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="인기도 감소"
              onClick={() => {
                const next = clamp((filters.popularityScore ?? 40) - 1, 40, 100);
                setLocalPopularity(next);
                setFilters((f) => ({ ...f, popularityScore: next }));
              }}>
              <Minus />
            </Button>

            <Slider
              value={[localPopularity]}
              min={40}
              max={100}
              step={1}
              onValueChange={(vals) => setLocalPopularity(vals[0] ?? 40)}
              onValueCommit={(vals) =>
                setFilters((f) => ({ ...f, popularityScore: clamp(vals[0] ?? 40, 40, 100) }))
              }
              className="w-full"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="인기도 증가"
              onClick={() => {
                const next = clamp((filters.popularityScore ?? 40) + 1, 40, 100);
                setLocalPopularity(next);
                setFilters((f) => ({ ...f, popularityScore: next }));
              }}>
              <Plus />
            </Button>
          </div>

          <div className="px-11 mt-1 flex justify-between text-[11px] text-muted-foreground">
            {[40, 60, 80, 100].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 날짜 범위 */}
      <section className="space-y-2">
        <SectionHeader
          title="날짜 범위"
          onReset={resetDates}
          disabled={!filters.startDate && !filters.endDate && !filters.onlyUpcoming}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
          />
        </div>
        <div className="cursor-pointer flex items-center gap-2 pt-1.5">
          <Checkbox
            className="cursor-pointer"
            id="onlyUpcoming"
            checked={filters.onlyUpcoming}
            onCheckedChange={(v) => setFilters((f) => ({ ...f, onlyUpcoming: v === true }))}
          />
          <label
            htmlFor="onlyUpcoming"
            className="cursor-pointer text-sm">
            미출시만
          </label>
        </div>
      </section>

      {/* 장르 */}
      <section className="space-y-2">
        <SectionHeader
          title="장르"
          onReset={resetGenres}
          disabled={filters.genres.length === 0}
        />
        <div className={cn("flex flex-wrap gap-2", tokenCommon.maxHeightClass)}>
          {GENRE_OPTIONS.map((g) => {
            const active = filters.genres.includes(g);
            return (
              <Badge
                key={g}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFilters((f) => ({ ...f, genres: toggleArray(f.genres, g) }));
                  }
                }}
                onClick={() => setFilters((f) => ({ ...f, genres: toggleArray(f.genres, g) }))}>
                {g}
              </Badge>
            );
          })}
        </div>
      </section>

      {/* 태그 */}
      <section className="space-y-2">
        <SectionHeader
          title="태그"
          onReset={resetTags}
          disabled={filters.tags.length === 0}
        />
        <div className={cn("flex flex-wrap gap-2", tokenCommon.maxHeightClass)}>
          {TAG_OPTIONS.map((t) => {
            const active = filters.tags.includes(t);
            return (
              <Badge
                key={t}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFilters((f) => ({ ...f, tags: toggleArray(f.tags, t) }));
                  }
                }}
                onClick={() => setFilters((f) => ({ ...f, tags: toggleArray(f.tags, t) }))}>
                {t}
              </Badge>
            );
          })}
        </div>
      </section>

      {/* 개발사 */}
      <TokenSection
        title="개발사"
        tokens={filters.developers}
        onChange={(tokens) => setFilters((f) => ({ ...f, developers: tokens }))}
        placeholder="Ubisoft, EA ..."
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetDevelopers}
            disabled={filters.developers.length === 0}>
            초기화
          </Button>
        }
      />

      {/* 퍼블리셔 */}
      <TokenSection
        title="퍼블리셔"
        tokens={filters.publishers}
        onChange={(tokens) => setFilters((f) => ({ ...f, publishers: tokens }))}
        placeholder="Sony, Nintendo ..."
        rightAction={
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={resetPublishers}
            disabled={filters.publishers.length === 0}>
            초기화
          </Button>
        }
      />

      {/* 플랫폼 */}
      <section className="space-y-2">
        <SectionHeader
          title="플랫폼"
          onReset={() => setFilters((f) => ({ ...f, platforms: [] }))}
          disabled={filters.platforms.length === 0}
        />
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((p) => {
            const active = filters.platforms.includes(p);
            return (
              <Badge
                key={p}
                variant={active ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer select-none capitalize",
                  active ? "ring-1 ring-primary" : "opacity-90 hover:opacity-100"
                )}
                role="checkbox"
                aria-checked={active}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFilters((f) => ({
                      ...f,
                      platforms: active ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
                    }));
                  }
                }}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    platforms: active ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
                  }))
                }>
                {p}
              </Badge>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* 공통 토큰 섹션 */
function useTokenInput(tokens: string[], onChange: (tokens: string[]) => void) {
  const [input, setInput] = useState("");
  const safeTokens = Array.isArray(tokens) ? tokens : [];
  const commit = (next: string[]) => onChange(Array.from(new Set(next)));
  const addToken = (token: string) => {
    const t = token.trim();
    if (!t) return;
    commit([...safeTokens, t]);
    setInput("");
  };
  const removeLast = () => {
    if (safeTokens.length === 0) return;
    commit(safeTokens.slice(0, -1));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addToken(input);
    } else if (e.key === "Backspace" && input.length === 0) {
      removeLast();
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const parts = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) {
      e.preventDefault();
      commit([...safeTokens, ...parts]);
    }
  };
  return { input, setInput, onKeyDown, onPaste, addToken };
}

function TokenSection({
  title,
  tokens,
  onChange,
  placeholder,
  suggestions,
  rightAction,
}: {
  title: string;
  tokens: string[];
  onChange: (tokens: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  rightAction?: React.ReactNode;
}) {
  const { input, setInput, onKeyDown, onPaste } = useTokenInput(tokens, onChange);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {rightAction}
      </div>

      <div className="rounded-lg border border-border/60 p-2">
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <Badge
              key={`${t}-${i}`}
              variant="secondary"
              className="gap-1">
              {t}
              <button
                className="outline-none"
                onClick={() => onChange(tokens.filter((x, idx) => !(x === t && idx === i)))}
                aria-label={`${title} ${t} 제거`}>
                <X className="w-3 h-3 opacity-70" />
              </button>
            </Badge>
          ))}
          <input
            className="bg-transparent outline-none flex-1 min-w-[120px] text-sm px-1 py-1"
            value={input}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
          />
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              className="px-2 h-7 rounded-full text-xs border border-border/60 hover:bg-accent"
              onClick={() => onChange(Array.from(new Set([...tokens, s])))}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

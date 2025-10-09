// app/games/hooks/useAllGamesUrlFilters.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirst, buildSearch, parseCsv, toCsv } from "../utils/searchParams";
import type { FiltersState } from "@/types/game.types";

/** 전체게임 페이지: searchParams ↔ FiltersState 공통 처리 */
const DEFAULT: FiltersState = {
  startDate: "",
  endDate: "",
  onlyUpcoming: false,
  genres: [],
  tags: [],
  developers: [],
  publishers: [],
  platforms: [], // string[] 그대로 사용
  sortBy: "releaseDate",
  sortOrder: "ASC",
  pageSize: 24,
  popularityScore: 40,
};

export function useAllGamesUrlFilters(
  initialSearchParams: Record<string, string | string[] | undefined>
) {
  const router = useRouter();

  const initial: FiltersState = useMemo(() => {
    const g = (k: string, def = "") => getFirst(initialSearchParams, k) ?? def;
    const toNum = (s: string, def: number) => {
      const n = Number(s);
      return Number.isFinite(n) ? n : def;
    };

    return {
      startDate: g("startDate", DEFAULT.startDate),
      endDate: g("endDate", DEFAULT.endDate),
      onlyUpcoming: g("onlyUpcoming") === "true",
      genres: parseCsv(g("genres")),
      tags: parseCsv(g("tags")),
      developers: parseCsv(g("developers")),
      publishers: parseCsv(g("publishers")),
      platforms: parseCsv(g("platforms")),
      sortBy: (g("sortBy", DEFAULT.sortBy) as FiltersState["sortBy"]) ?? DEFAULT.sortBy,
      sortOrder:
        (g("sortOrder", DEFAULT.sortOrder) as FiltersState["sortOrder"]) ?? DEFAULT.sortOrder,
      pageSize: Math.min(
        50,
        Math.max(10, toNum(g("pageSize", String(DEFAULT.pageSize)), DEFAULT.pageSize))
      ),
      popularityScore: toNum(
        g("popularityScore", String(DEFAULT.popularityScore)),
        DEFAULT.popularityScore
      ),
    };
  }, [initialSearchParams]);

  const [filters, setFilters] = useState<FiltersState>(initial);

  const syncUrl = useCallback(
    (f: FiltersState) => {
      const sp = buildSearch({
        startDate: f.startDate || undefined,
        endDate: f.endDate || undefined,
        onlyUpcoming: f.onlyUpcoming ? "true" : undefined,
        genres: toCsv(f.genres),
        tags: toCsv(f.tags),
        developers: toCsv(f.developers),
        publishers: toCsv(f.publishers),
        platforms: toCsv(f.platforms),
        sortBy: f.sortBy,
        sortOrder: f.sortOrder,
        pageSize: f.pageSize,
        popularityScore: f.popularityScore,
      });
      router.replace(`/games?${sp.toString()}`, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    syncUrl(filters);
  }, [filters, syncUrl]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT);
  }, []);

  return { filters, setFilters, initial, resetFilters };
}

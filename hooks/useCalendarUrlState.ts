// app/games/hooks/useCalendarUrlState.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getFirst,
  buildSearch,
  isYYYYMM,
  isDD,
  toYYYYMM,
  type SearchParams,
} from "../utils/searchParams";

export type SortBy = "name" | "date" | "popularityScore";
export type ViewMode = "card" | "list";
export type LayoutMode = "split" | "list-only";

/** 캘린더 페이지: URL ↔ 상태 공통 처리 */
export function useCalendarUrlState(initialSearchParams: SearchParams) {
  const router = useRouter();
  const today = new Date();

  const urlM = getFirst(initialSearchParams, "m"); // YYYY-MM
  const urlD = getFirst(initialSearchParams, "d"); // DD

  const initialYear = isYYYYMM(urlM) ? Number(urlM.slice(0, 4)) : today.getFullYear();
  const initialMonth = isYYYYMM(urlM) ? Number(urlM.slice(5, 7)) : today.getMonth() + 1;
  const initialDay = isDD(urlD) ? Number(urlD) : null;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay);

  const [sortBy, setSortBy] = useState<SortBy>("popularityScore");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [mounted, setMounted] = useState(false);

  // 최초 진입 시 URL 정규화
  useEffect(() => {
    if (!isYYYYMM(urlM)) {
      const sp = buildSearch({ m: toYYYYMM(initialYear, initialMonth), d: initialDay });
      router.replace(`/calendar?${sp.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 레이아웃 모드 복원/저장
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("games-layout-mode");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() <= parsed.expiry) setLayoutMode(parsed.value);
        else localStorage.removeItem("games-layout-mode");
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (!mounted) return;
    try {
      const expiry = Date.now() + 1000 * 60 * 60 * 24 * 30 * 6; // 6개월
      localStorage.setItem("games-layout-mode", JSON.stringify({ value: layoutMode, expiry }));
    } catch {}
  }, [layoutMode, mounted]);

  const syncUrl = useCallback(
    (y = selectedYear, m = selectedMonth, d = selectedDay) => {
      const sp = buildSearch({ m: toYYYYMM(y, m), d: d && d > 0 ? d : null });
      router.replace(`/calendar?${sp.toString()}`, { scroll: false });
    },
    [router, selectedYear, selectedMonth, selectedDay]
  );

  return {
    selectedYear,
    selectedMonth,
    selectedDay,
    setSelectedYear,
    setSelectedMonth,
    setSelectedDay,
    viewMode,
    setViewMode,
    layoutMode,
    setLayoutMode,
    sortBy,
    setSortBy,
    syncUrl,
    yearMonth: toYYYYMM(selectedYear, selectedMonth),
  };
}

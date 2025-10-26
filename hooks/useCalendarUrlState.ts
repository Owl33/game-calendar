// app/games/hooks/useCalendarUrlState.ts
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  resolveCalendarContext,
  buildCalendarPath,
  type CalendarSearchParams,
  type CalendarSort,
} from "@/lib/url/calendar";
import { toYYYYMM } from "@/utils/searchParams";

export type SortBy = CalendarSort;
export type ViewMode = "card" | "list";
export type LayoutMode = "split" | "list-only";

/** 캘린더 페이지: URL ↔ 상태 공통 처리 */
export function useCalendarUrlState(initialSearchParams: CalendarSearchParams) {
  const router = useRouter();
  const todayRef = useRef(new Date());
  const initialContext = useMemo(
    () => resolveCalendarContext(initialSearchParams, todayRef.current),
    [initialSearchParams]
  );

  const [selectedYear, setSelectedYear] = useState(initialContext.year);
  const [selectedMonth, setSelectedMonth] = useState(initialContext.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialContext.day ?? null);
  const [sortBy, setSortByState] = useState<SortBy>(initialContext.sortBy);

  // 🔑 URL 파라미터 변경 시 상태 동기화 (뒤로가기 대응)
  useEffect(() => {
    const context = resolveCalendarContext(initialSearchParams, todayRef.current);
    const { year, month, day, sortBy: nextSort } = context;

    if (year !== selectedYear) setSelectedYear(year);
    if (month !== selectedMonth) setSelectedMonth(month);
    if (day !== selectedDay) setSelectedDay(day);
    if (nextSort !== sortBy) setSortByState(nextSort);
  }, [initialSearchParams, selectedYear, selectedMonth, selectedDay, sortBy]);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [mounted, setMounted] = useState(false);

  // 최초 진입 시 URL 정규화
  useEffect(() => {
    if (!initialContext.hasExplicitMonth) {
      const path = buildCalendarPath(initialContext.year, initialContext.month, {
        day: initialContext.day,
        sort: initialContext.sortBy,
      });
      router.replace(path, { scroll: false });
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
    (y = selectedYear, m = selectedMonth, d = selectedDay, s = sortBy) => {
      const path = buildCalendarPath(y, m, {
        day: d && d > 0 ? d : null,
        sort: s,
      });
      router.replace(path, { scroll: false });
    },
    [router, selectedYear, selectedMonth, selectedDay, sortBy]
  );

  const setSortBy = useCallback(
    (next: SortBy) => {
      setSortByState(next);
      syncUrl(selectedYear, selectedMonth, selectedDay, next);
    },
    [selectedYear, selectedMonth, selectedDay, syncUrl]
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

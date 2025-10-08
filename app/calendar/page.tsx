"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Columns2 } from "lucide-react";
import { GameCalendar } from "./components/GameCalendar";
import { CalendarHeader } from "./components/CalendarHeader";
import { GameList } from "@/components/games/GameList";
import { Game, GamesByDate, CalendarApiResponse } from "@/types/game.types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { GameListHeader } from "@/components/games/GameListHeader";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Calendar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) URL → 초기 상태 복원
  const today = new Date();
  const urlM = searchParams.get("m"); // YYYY-MM
  const urlD = searchParams.get("d"); // DD (1~31)
  const initialYear =
    urlM && /^\d{4}-\d{2}$/.test(urlM) ? Number(urlM.slice(0, 4)) : today.getFullYear();
  const initialMonth =
    urlM && /^\d{4}-\d{2}$/.test(urlM) ? Number(urlM.slice(5, 7)) : today.getMonth() + 1;
  const initialDay = urlD && /^\d{1,2}$/.test(urlD) ? Number(urlD) : null;

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  // 레이아웃 모드 (PC에서 캘린더 표시/숨김)
  const [layoutMode, setLayoutMode] = useState<"split" | "list-only">("split");
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "popularityScore">("popularityScore");

  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("games-layout-mode");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = new Date().getTime();
        if (now <= parsed.expiry) {
          setLayoutMode(parsed.value);
        } else {
          localStorage.removeItem("games-layout-mode");
        }
      } catch {
        console.warn("Failed to parse layout mode from localStorage");
      }
    }
  }, []);

  // layoutMode 변경 시 localStorage에 저장
  useEffect(() => {
    if (!mounted) return;
    const expiryMonths = 6;
    const now = new Date().getTime();
    const expiryTime = now + expiryMonths * 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "games-layout-mode",
      JSON.stringify({ value: layoutMode, expiry: expiryTime })
    );
  }, [layoutMode, mounted]);

  // 2) 상태 → URL 동기화
  const syncUrl = (y = selectedYear, m = selectedMonth, d = selectedDay) => {
    const sp = new URLSearchParams(searchParams.toString());
    const ym = `${y}-${String(m).padStart(2, "0")}`;
    sp.set("m", ym);
    if (d && d > 0) sp.set("d", String(d));
    else sp.delete("d");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  // 최초 마운트 시 URL 정규화(없다면 세팅)
  useEffect(() => {
    const hasM = !!searchParams.get("m");
    if (!hasM) syncUrl(initialYear, initialMonth, initialDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // yearMonth 계산 (YYYY-MM 형식)
  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  // API 데이터
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games", "calendar", yearMonth],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/games/all?startDate=${yearMonth}-01&endDate=${yearMonth}-31&pageSize=200`
      );

      if (!res.ok) throw new Error("Failed to fetch games");
      const result = await res.json();
      return result.data as CalendarApiResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const games = apiResponse?.data || [];

  // 날짜별 게임 매핑
  const gamesByDate: GamesByDate = useMemo(() => {
    const result: GamesByDate = {};
    games.forEach((game: Game) => {
      const released = new Date(game.releaseDate);
      const day = released.getDate();
      if (!result[day]) result[day] = [];
      result[day].push(game);
    });
    return result;
  }, [games]);

  // 필터된 게임 목록
  const filteredGames = useMemo(() => {
    if (!selectedDay) return games;
    return games.filter((game: Game) => {
      const released = new Date(game.releaseDate);
      return released.getDate() === selectedDay;
    });
  }, [games, selectedDay]);

  // 액션 함수들 (상태 + URL 함께 동기화)
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedDay(null);
    syncUrl(year, selectedMonth, null);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setSelectedDay(null);
    syncUrl(selectedYear, month, null);
  };

  const handleDateChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(null);
    syncUrl(year, month, null);
  };

  const handleDaySelect = (day: number | null) => {
    setSelectedDay(day);
    syncUrl(selectedYear, selectedMonth, day);
  };

  const handleGameClick = (game: Game) => {
    const sp = new URLSearchParams(searchParams.toString());
    router.push(`/games/${game.gameId}?${sp.toString()}`);
  };
  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case "popularityScore":
        return b.popularityScore - a.popularityScore; // 높은 점수 우선
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto h-full min-h-0 flex flex-col">
      {/* 레이아웃 토글 (데스크톱 전용) */}
      <div className="hidden lg:flex justify-end mb-4 px-4">
        <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
          <Button
            variant={layoutMode === "split" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("split")}
            className="h-8 px-3 gap-2">
            <Columns2 className="h-4 w-4" />
            <span className="text-sm">분할 보기</span>
          </Button>
          <Button
            variant={layoutMode === "list-only" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setLayoutMode("list-only")}
            className="h-8 px-3 gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm">리스트만</span>
          </Button>
        </div>
      </div>

      {/* 단일 반응형 레이아웃 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={layoutMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-1 overflow-hidden min-h-0",
            // 데스크톱에서 split일 때만 12그리드
            layoutMode === "split" ? "lg:grid lg:grid-cols-12 lg:gap-4" : "block"
          )}>
          {/* 캘린더 섹션 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              // 기본: 모바일에선 항상 보임(상단)
              "mb-6 lg:mb-0",
              // split 모드: 데스크톱 좌측 8칸
              layoutMode === "split" && "lg:col-span-8",
              // list-only 모드: 데스크톱에서는 숨김(모바일만 표시)
              layoutMode === "list-only" && "lg:hidden"
            )}>
            <GameCalendar
              year={selectedYear}
              month={selectedMonth}
              selectedDay={selectedDay}
              gamesByDate={gamesByDate}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              onDateChange={handleDateChange}
              onDaySelect={handleDaySelect}
            />
          </motion.div>

          {/* 게임 리스트 섹션 */}
          <div
            className={cn(
              // split 모드: 데스크톱 우측 4칸, 전체 높이에서 스크롤
              layoutMode === "split" && "lg:col-span-4",
              // list-only 모드: 데스크톱에서 가운데 정렬/최대폭 제한
              layoutMode === "list-only" && "lg:max-w-4xl lg:mx-auto",
              "h-full min-h-0 flex flex-col"
            )}>
            {/* list-only 모드에서 데스크톱 상단에 날짜 헤더만 별도로 노출하고 싶다면 */}
            {layoutMode === "list-only" && (
              <div className="hidden lg:block mb-4">
                <CalendarHeader
                  year={selectedYear}
                  selectedMonth={selectedMonth}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                  onDateChange={handleDateChange}
                />
              </div>
            )}
            <>
              <GameListHeader
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                className="mb-4"
              />
              <GameList
                viewMode={viewMode}
                className=" p-4 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
                games={sortedGames}
                isLoading={isLoading}
                layoutMode={layoutMode}
              />
            </>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

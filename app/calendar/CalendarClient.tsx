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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GameListHeader } from "@/components/games/GameListHeader";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CalendarClient({
  initialSearchParams,
}: {
  initialSearchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();

  // -------- URL 초기값 파싱(서버에서 넘겨준 searchParams 사용) --------
  const today = new Date();
  const get = (k: string) => {
    const v = initialSearchParams?.[k];
    return Array.isArray(v) ? v[0] : v ?? null;
  };
  const urlM = get("m"); // YYYY-MM
  const urlD = get("d"); // DD

  const initialYear =
    urlM && /^\d{4}-\d{2}$/.test(urlM) ? Number(urlM.slice(0, 4)) : today.getFullYear();
  const initialMonth =
    urlM && /^\d{4}-\d{2}$/.test(urlM) ? Number(urlM.slice(5, 7)) : today.getMonth() + 1;
  const initialDay = urlD && /^\d{1,2}$/.test(urlD) ? Number(urlD) : null;

  // -------- 상태 --------
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [layoutMode, setLayoutMode] = useState<"split" | "list-only">("split");
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "popularityScore">("popularityScore");

  // -------- localStorage에서 레이아웃 복원 (클라이언트에서만) --------
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("games-layout-mode");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        if (now <= parsed.expiry) {
          setLayoutMode(parsed.value);
        } else {
          localStorage.removeItem("games-layout-mode");
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // 레이아웃 변경 시 저장
  useEffect(() => {
    if (!mounted) return;
    const expiry = Date.now() + 6 * 30 * 24 * 60 * 60 * 1000; // 6개월
    localStorage.setItem("games-layout-mode", JSON.stringify({ value: layoutMode, expiry }));
  }, [layoutMode, mounted]);

  // -------- 상태 → URL 동기화 --------
  const syncUrl = (y = selectedYear, m = selectedMonth, d = selectedDay) => {
    const sp = new URLSearchParams();
    sp.set("m", `${y}-${String(m).padStart(2, "0")}`);
    if (d && d > 0) sp.set("d", String(d));
    router.replace(`/calendar?${sp.toString()}`, { scroll: false });
  };

  // 최초 진입 시 `m`이 없으면 URL 정규화
  useEffect(() => {
    if (!urlM) syncUrl(initialYear, initialMonth, initialDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- 데이터 가져오기 --------
  const yearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const { data: apiResponse, isLoading } = useQuery({
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

  const games: Game[] = useMemo(() => apiResponse?.data ?? [], [apiResponse]);

  // -------- 날짜별 그룹핑 --------
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

  // -------- 날짜 필터 --------
  const filteredGames = useMemo(() => {
    if (!selectedDay) return games;
    return games.filter((game: Game) => {
      const released = new Date(game.releaseDate);
      return released.getDate() === selectedDay;
    });
  }, [games, selectedDay]);

  // -------- 정렬 --------
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

  // -------- 액션 (상태 + URL 동기화) --------
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

  // -------- UI --------
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
            layoutMode === "split" ? "lg:grid lg:grid-cols-12 lg:gap-4" : "block"
          )}>
          {/* 캘린더 섹션 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mb-6 lg:mb-0",
              layoutMode === "split" && "lg:col-span-8",
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
              layoutMode === "split" && "lg:col-span-4",
              layoutMode === "list-only" && "lg:max-w-4xl lg:mx-auto",
              "h-full min-h-0 flex flex-col"
            )}>
            {/* list-only 모드에서 데스크톱 상단에 날짜 헤더만 별도로 노출 */}
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
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

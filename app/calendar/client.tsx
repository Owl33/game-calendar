// app/calendar/CalendarClient.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Columns2 } from "lucide-react";
import { GameCalendar } from "./components/GameCalendar";
import { CalendarHeader } from "./components/CalendarHeader";
import { GameList } from "@/components/games/GameList";
import { Game, GamesByDate } from "@/types/game.types";
import { cn } from "@/lib/utils";
import { GameListHeader } from "@/components/games/GameListHeader";
import { gameKeys, fetchCalendarMonth } from "@/lib/queries/game";
import { useCalendarUrlState } from "@/hooks/useCalendarUrlState";

export default function CalendarClient({
  initialSearchParams,
}: {
  initialSearchParams: Record<string, string | string[] | undefined>;
}) {
  const {
    selectedYear, selectedMonth, selectedDay,
    setSelectedYear, setSelectedMonth, setSelectedDay,
    viewMode, setViewMode,
    layoutMode, setLayoutMode,
    sortBy, setSortBy,
    syncUrl,
    yearMonth,
  } = useCalendarUrlState(initialSearchParams);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: gameKeys.calendar(yearMonth),
    queryFn: ({ signal }) => fetchCalendarMonth(yearMonth, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const games: Game[] = useMemo(() => apiResponse?.data ?? [], [apiResponse]);

  const gamesByDate: GamesByDate = useMemo(() => {
    const result: GamesByDate = {};
    for (const g of games) {
      const day = new Date(g.releaseDate).getDate();
      (result[day] ??= []).push(g);
    }
    return result;
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!selectedDay) return games;
    return games.filter((g) => new Date(g.releaseDate).getDate() === selectedDay);
  }, [games, selectedDay]);

  const sortedGames = useMemo(() => {
    const arr = [...filteredGames];
    if (sortBy === "popularityScore") arr.sort((a, b) => b.popularityScore - a.popularityScore);
    else if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "date") arr.sort((a, b) => +new Date(a.releaseDate) - +new Date(b.releaseDate));
    return arr;
  }, [filteredGames, sortBy]);

  const handleYearChange = (y: number) => { setSelectedYear(y); setSelectedDay(null); syncUrl(y, selectedMonth, null); };
  const handleMonthChange = (m: number) => { setSelectedMonth(m); setSelectedDay(null); syncUrl(selectedYear, m, null); };
  const handleDateChange = (y: number, m: number) => { setSelectedYear(y); setSelectedMonth(m); setSelectedDay(null); syncUrl(y, m, null); };
  const handleDaySelect = (d: number | null) => { setSelectedDay(d); syncUrl(selectedYear, selectedMonth, d); };

  return (
    <div className="container mx-auto h-full min-h-0 flex flex-col">
      <div className="hidden lg:flex justify-end mb-4 px-4">
        <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
          <Button variant={layoutMode === "split" ? "secondary" : "ghost"} size="sm" onClick={() => setLayoutMode("split")} className="h-8 px-3 gap-2">
            <Columns2 className="h-4 w-4" />
            <span className="text-sm">분할 보기</span>
          </Button>
          <Button variant={layoutMode === "list-only" ? "secondary" : "ghost"} size="sm" onClick={() => setLayoutMode("list-only")} className="h-8 px-3 gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm">리스트만</span>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={layoutMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("flex-1 overflow-hidden min-h-0", layoutMode === "split" ? "lg:grid lg:grid-cols-12 lg:gap-4" : "block")}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("mb-6 lg:mb-0", layoutMode === "split" && "lg:col-span-8", layoutMode === "list-only" && "lg:hidden")}
          >
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

          <div className={cn(layoutMode === "split" && "lg:col-span-4", layoutMode === "list-only" && "lg:max-w-4xl lg:mx-auto", "h-full min-h-0 flex flex-col")}>
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
              className="p-4 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
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

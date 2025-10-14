// app/calendar/CalendarClient.tsx
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
    selectedYear,
    selectedMonth,
    selectedDay,
    setSelectedYear,
    setSelectedMonth,
    setSelectedDay,
    viewMode,
    setViewMode,
    layoutMode,
    sortBy,
    setSortBy,
    syncUrl,
    yearMonth,
  } = useCalendarUrlState(initialSearchParams);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: gameKeys.calendar(yearMonth),
    queryFn: ({ signal }) => fetchCalendarMonth(yearMonth, signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (prev) => prev,
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
    else if (sortBy === "date")
      arr.sort((a, b) => +new Date(a.releaseDate) - +new Date(b.releaseDate));
    return arr;
  }, [filteredGames, sortBy]);

  const handleYearChange = (y: number) => {
    setSelectedYear(y);
    setSelectedDay(null);
    syncUrl(y, selectedMonth, null);
  };
  const handleMonthChange = (m: number) => {
    setSelectedMonth(m);
    setSelectedDay(null);
    syncUrl(selectedYear, m, null);
  };
  const handleDateChange = (y: number, m: number) => {
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(null);
    syncUrl(y, m, null);
  };
  const handleDaySelect = (d: number | null) => {
    setSelectedDay(d);
    syncUrl(selectedYear, selectedMonth, d);
  };

  return (
    <div className="container mx-auto lg:h-[calc(100vh-128px)] min-h-0 flex flex-col">
      <div
        className={cn(
          "flex-1 overflow-hidden min-h-0 transition-opacity duration-200",
          layoutMode === "split" ? "lg:grid lg:grid-cols-12 lg:gap-4" : "block"
        )}>
        <div
          className={cn(
            "mb-6 lg:mb-0 transition-all duration-300",
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
        </div>

        <div
          className={cn(
            layoutMode === "split" && "lg:col-span-4",
            layoutMode === "list-only" && "lg:max-w-4xl lg:mx-auto",
            "h-full min-h-0 flex flex-col"
          )}>
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
            onViewModeChange={setViewMode}
            className="mb-4"
          />

          <GameList
            className="p-4 grid gap-4 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]"
            games={sortedGames}
            isLoading={isLoading}
            layoutMode={layoutMode}
            scrollKey={`${selectedYear}-${selectedMonth}-${selectedDay}`}
          />
        </div>
      </div>
    </div>
  );
}

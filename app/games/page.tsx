"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GameCalendar } from "./components/GameCalendar";
import { GameList } from "./components/GameList";
import { Game, GamesByDate, CalendarApiResponse } from "./types/game.types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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

  // 2) 상태 → URL 동기화 유틸
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
  const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;

  // API 데이터 가져오기
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["games", "calendar", yearMonth],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/games/calendar?month=${yearMonth}`);
      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }
      const result = await response.json();
      return result.data as CalendarApiResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const games = apiResponse?.data || [];
  console.log(games);
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
    // 상세로 이동할 때 현재 m, d를 그대로 붙여서 전달(선택)
    const sp = new URLSearchParams(searchParams.toString());
    router.push(`/games/${game.gameId}?${sp.toString()}`);
  };

  return (
    <div className="container mx-auto h-full">
      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-full">
        {/* 캘린더 섹션 */}
        <div className="lg:col-span-8">
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

        {/* 게임 리스트 섹션 */}
        <div className="px-4 pb-4 lg:col-span-4 h-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
            selectedDay={selectedDay}
          />
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="lg:hidden space-y-6">
        <div>
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

        <div className="px-4 pb-4">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
            selectedDay={selectedDay}
          />
        </div>
      </div>
    </div>
  );
}

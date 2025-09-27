import { useMemo } from "react";
import { Game, GamesByDate } from "../types/game.types";

interface UseCalendarDataProps {
  games: Game[];
  selectedYear: number;
  selectedMonth: number;
  selectedDay: number | null;
}

export function useCalendarData({
  games,
  selectedYear,
  selectedMonth,
  selectedDay
}: UseCalendarDataProps) {
  // 날짜별 게임 매핑 - 복잡한 연산이므로 useMemo 유지
  const gamesByDate: GamesByDate = useMemo(() => {
    const result: GamesByDate = {};

    games.forEach((game) => {
      const released = new Date(game.released);
      if (
        released.getFullYear() === selectedYear &&
        released.getMonth() + 1 === selectedMonth
      ) {
        const day = released.getDate();
        if (!result[day]) result[day] = [];
        result[day].push(game);
      }
    });

    return result;
  }, [games, selectedYear, selectedMonth]);

  // 필터된 게임 목록 - 복잡한 필터링이므로 useMemo 유지
  const filteredGames = useMemo(() => {
    if (!selectedDay) return games;

    return games.filter((game) => {
      const released = new Date(game.released);
      return (
        released.getFullYear() === selectedYear &&
        released.getMonth() + 1 === selectedMonth &&
        released.getDate() === selectedDay
      );
    });
  }, [games, selectedYear, selectedMonth, selectedDay]);

  // 단순한 문자열 연산 - useMemo 제거
  const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;

  return {
    gamesByDate,
    filteredGames,
    yearMonth
  };
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/useApi";
import { useCalendarData } from "./useCalendarData";
import { Game } from "../types/game.types";
import sampleGamesData from "../data/sample-games.json";

export function useGameCalendar() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // API 데이터 가져오기
  const { yearMonth } = useCalendarData({
    games: [],
    selectedYear,
    selectedMonth,
    selectedDay
  });

  // 샘플 데이터 가져오기 함수
  const getSampleData = () => {
    const monthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
    return (sampleGamesData as any)[monthKey] || [];
  };

  const {
    data: games = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["games", yearMonth],
    queryFn: async () => {
      // 개발 중에는 샘플 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 300));
        return getSampleData();
      }

      // 프로덕션에서는 실제 API 호출
      const { success, data } = await useApi.get(`/games/${yearMonth}`);
      return success ? data : [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // 계산된 데이터
  const { gamesByDate, filteredGames } = useCalendarData({
    games,
    selectedYear,
    selectedMonth,
    selectedDay
  });

  // 액션 함수들
  const actions = {
    selectYear: (year: number) => {
      setSelectedDay(null);
      setSelectedYear(year);
    },
    selectMonth: (month: number) => {
      setSelectedDay(null);
      setSelectedMonth(month);
    },
    selectDay: (day: number | null) => {
      setSelectedDay(day);
    },
    clearSelection: () => {
      setSelectedDay(null);
    }
  };

  return {
    // 상태
    selectedDate: {
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay
    },

    // 데이터
    games,
    gamesByDate,
    filteredGames,

    // 상태 관리
    isLoading,
    error,

    // 액션
    actions
  };
}
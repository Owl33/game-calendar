/**
 * GameCalendar - 게임 출시 캘린더
 */

"use client";

import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { GamesByDate } from "@/types/game.types";

interface GameCalendarProps {
  year: number;
  month: number;
  selectedDay: number | null;
  gamesByDate: GamesByDate;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDateChange?: (year: number, month: number) => void;
  onDaySelect: (day: number | null) => void;
  className?: string;
}

export function GameCalendar({
  year,
  month,
  selectedDay,
  gamesByDate,
  onMonthChange,
  onYearChange,
  onDateChange,
  onDaySelect,
  className,
}: GameCalendarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <CalendarHeader
        year={year}
        selectedMonth={month}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        onDateChange={onDateChange}
      />

      {/* 모바일에서는 CalendarGrid 숨김 */}
      <div className="hidden lg:block">
        <CalendarGrid
          year={year}
          month={month}
          gamesByDate={gamesByDate}
          selectedDay={selectedDay}
          onDaySelect={onDaySelect}
        />
      </div>
    </div>
  );
}

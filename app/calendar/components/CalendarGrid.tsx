/**
 * CalendarGrid - 캘린더 그리드
 */

"use client";

import { GamesByDate } from "@/types/game.types";
import { CalendarDay } from "./CalendarDay";

interface CalendarGridProps {
  year: number;
  month: number;
  gamesByDate: GamesByDate;
  selectedDay: number | null;
  onDaySelect: (day: number | null) => void;
}

export function CalendarGrid({
  year,
  month,
  gamesByDate,
  selectedDay,
  onDaySelect,
}: CalendarGridProps) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();

  const weekDays = [
    { name: "일", className: "text-destructive" },
    { name: "월", className: "" },
    { name: "화", className: "" },
    { name: "수", className: "" },
    { name: "목", className: "" },
    { name: "금", className: "" },
    { name: "토", className: "text-info" },
  ];

  // 달력의 행 수 계산 (5주 또는 6주)
  const totalCells = firstDay + lastDay;
  const rows = Math.ceil(totalCells / 7);

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center font-semibold text-sm flex-shrink-0">
        {weekDays.map((weekDay, index) => (
          <div
            key={index}
            className={`py-1 text-muted-foreground ${weekDay.className}`}>
            {weekDay.name}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        className="grid grid-cols-7 px-2 flex-1 min-h-0 "
        style={{
          gap: "0.75rem",
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}>
        {/* 빈 칸 (월 시작 전) */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="p-3 rounded-xl bg-muted/70 w-full h-full"
          />
        ))}

        {/* 실제 날짜들 */}
        {Array.from({ length: lastDay }, (_, index) => index + 1).map((day) => (
          <CalendarDay
            key={day}
            day={day}
            games={gamesByDate[day] || []}
            isSelected={selectedDay === day}
            onClick={() => onDaySelect(selectedDay === day ? null : day)}
          />
        ))}
      </div>
    </div>
  );
}

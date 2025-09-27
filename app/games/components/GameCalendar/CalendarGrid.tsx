import { CalendarDay } from "./CalendarDay";
import { GamesByDate } from "../../types/game.types";

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
    { name: "일", className: "text-red-500" },
    { name: "월", className: "" },
    { name: "화", className: "" },
    { name: "수", className: "" },
    { name: "목", className: "" },
    { name: "금", className: "" },
    { name: "토", className: "text-blue-500" },
  ];

  return (
    <div className="space-y-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center font-semibold text-sm">
        {weekDays.map((weekDay, index) => (
          <div
            key={index}
            className={`py-2 text-muted-foreground ${weekDay.className}`}>
            {weekDay.name}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {/* 빈 칸 (월 시작 전) */}
        {Array.from({ length: firstDay }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="h-32 rounded-xl bg-muted/30"
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

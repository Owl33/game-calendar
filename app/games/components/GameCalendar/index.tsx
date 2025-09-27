import { Card } from "@/components/ui/card";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { GamesByDate } from "../../types/game.types";

interface GameCalendarProps {
  year: number;
  month: number;
  selectedDay: number | null;
  gamesByDate: GamesByDate;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
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
      />

      <CalendarGrid
        year={year}
        month={month}
        gamesByDate={gamesByDate}
        selectedDay={selectedDay}
        onDaySelect={onDaySelect}
      />
    </div>
  );
}

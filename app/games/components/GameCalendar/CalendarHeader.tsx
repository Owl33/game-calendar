import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarHeaderProps {
  year: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onYearChange?: (year: number) => void;
  className?: string;
}

export function CalendarHeader({
  year,
  selectedMonth,
  onMonthChange,
  onYearChange,
  className,
}: CalendarHeaderProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* 연도 네비게이션 */}{" "}
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onYearChange?.(year - 1)}>
        <ChevronLeft />
      </Button>
      <div className="">
        <h2 className="font-bold text-lg text-foreground tracking-tight">{year}년</h2>
      </div>
      {/* 월 선택 버튼들 */}
      <div className="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-4">
        {months.map((month) => (
          <Button
            key={month}
            variant={month === selectedMonth ? "default" : "ghost"}
            size="sm"
            onClick={() => onMonthChange(month)}
            className={cn(
              "font-semibold transition-all duration-300 transform hover:scale-105 h-8 text-xs",
              month === selectedMonth
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "hover:bg-gradient-to-r hover:from-muted hover:to-muted/80 hover:shadow-md"
            )}>
            {month}월
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => onYearChange?.(year + 1)}>
        <ChevronRight />
      </Button>
    </div>
  );
}

/**
 * CalendarHeader - 캘린더 년/월 선택 헤더
 */

"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Modal } from "@/components/motion/Modal";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  year: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onYearChange?: (year: number) => void;
  onDateChange?: (year: number, month: number) => void;
  className?: string;
}

// 년도 버튼 컴포넌트 - year가 변경될 때만 리렌더링
const YearButton = memo(({ year, onOpenDatePicker }: { year: number; onOpenDatePicker: () => void }) => (
  <div className="min-w-[80px] relative lg:min-w-[80px]">
    <div className="animate-fadeIn">
      <Button
        variant="ghost"
        onClick={onOpenDatePicker}>
        {year}년
      </Button>
    </div>
  </div>
));

YearButton.displayName = "YearButton";

export function CalendarHeader({
  year,
  selectedMonth,
  onMonthChange,
  onYearChange,
  onDateChange,
  className,
}: CalendarHeaderProps) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempYear, setTempYear] = useState(year);
  const [tempMonth, setTempMonth] = useState(selectedMonth);

  const handleOpenDatePicker = useCallback(() => {
    setTempYear(year);
    setTempMonth(selectedMonth);
    setShowDatePicker(true);
  }, [year, selectedMonth]);

  const handleCancel = () => setShowDatePicker(false);

  const handleConfirm = () => {
    if (onDateChange) {
      onDateChange(tempYear, tempMonth);
    } else {
      onYearChange?.(tempYear);
      onMonthChange(tempMonth);
    }
    setShowDatePicker(false);
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      const newYear = year - 1;
      const newMonth = 12;
      if (onDateChange) {
        onDateChange(newYear, newMonth);
      } else {
        onYearChange?.(newYear);
        onMonthChange(newMonth);
      }
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      const newYear = year + 1;
      const newMonth = 1;
      if (onDateChange) {
        onDateChange(newYear, newMonth);
      } else {
        onYearChange?.(newYear);
        onMonthChange(newMonth);
      }
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  return (
    <div className={cn("mb-4", className)}>
      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handlePreviousMonth}>
          <ChevronLeft />
        </Button>

        <YearButton
          year={year}
          onOpenDatePicker={handleOpenDatePicker}
        />

        <div className="flex-1 grid grid-cols-12 gap-4">
          {months.map((month) => (
            <Button
              className="transition"
              key={month}
              variant={month === selectedMonth ? "default" : "ghost"}
              size="sm"
              onClick={() => onMonthChange(month)}>
              <span>{month}월</span>
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleNextMonth}>
          <ChevronRight />
        </Button>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handlePreviousMonth}>
            <ChevronLeft />
          </Button>

          <YearButton
            year={year}
            onOpenDatePicker={handleOpenDatePicker}
          />

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {months.map((month) => (
            <Button
              className="transition"
              key={month}
              variant={month === selectedMonth ? "default" : "ghost"}
              size="sm"
              onClick={() => onMonthChange(month)}>
              <span>{month}월</span>
            </Button>
          ))}
        </div>
      </div>

      {/* DatePicker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <Modal
            isOpen={showDatePicker}
            onClose={handleCancel}
            contentClassName="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl p-6 min-w-[400px] bg-card elevated-card">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">날짜 선택</h3>
                <p className="text-sm text-muted-foreground">원하는 년도와 월을 선택해주세요</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">년도</label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {Array.from({ length: 21 }, (_, i) => year - 10 + i).map((yearOption) => (
                    <Button
                      key={yearOption}
                      variant={yearOption === tempYear ? "default" : "ghost"}
                      size="sm"
                      className="h-8"
                      onClick={() => setTempYear(yearOption)}>
                      {yearOption}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">월</label>
                <div className="grid grid-cols-4 gap-2">
                  {months.map((month) => (
                    <Button
                      key={month}
                      variant={month === tempMonth ? "default" : "ghost"}
                      size="sm"
                      className="h-8"
                      onClick={() => setTempMonth(month)}>
                      {month}월
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}>
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}>
                  확인
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

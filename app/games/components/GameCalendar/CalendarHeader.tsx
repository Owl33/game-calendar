import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface CalendarHeaderProps {
  year: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onYearChange?: (year: number) => void;
  onDateChange?: (year: number, month: number) => void;
  className?: string;
}

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

  // DatePicker 열기
  const handleOpenDatePicker = () => {
    setTempYear(year);
    setTempMonth(selectedMonth);
    setShowDatePicker(true);
  };

  // DatePicker 취소
  const handleCancel = () => {
    setShowDatePicker(false);
  };

  // DatePicker 확인
  const handleConfirm = () => {
    onDateChange?.(tempYear, tempMonth) || (onYearChange?.(tempYear) && onMonthChange(tempMonth));
    setShowDatePicker(false);
  };

  // 이전 달로 이동
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      // 1월이면 전년 12월로
      const newYear = year - 1;
      const newMonth = 12;
      onDateChange?.(newYear, newMonth) || (onYearChange?.(newYear) && onMonthChange(newMonth));
    } else {
      // 그 외에는 이전 달로
      onMonthChange(selectedMonth - 1);
    }
  };

  // 다음 달로 이동
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      // 12월이면 내년 1월로
      const newYear = year + 1;
      const newMonth = 1;
      onDateChange?.(newYear, newMonth) || (onYearChange?.(newYear) && onMonthChange(newMonth));
    } else {
      // 그 외에는 다음 달로
      onMonthChange(selectedMonth + 1);
    }
  };

  return (
    <div className="mb-4">
      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:flex lg:items-center lg:gap-4">
        {/* 월 네비게이션 - 이전 달 */}

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handlePreviousMonth}>
          <ChevronLeft />
        </Button>

        <div className="min-w-[80px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}>
              <Button
                variant="ghost"
                onClick={handleOpenDatePicker}>
                {year}년
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 월 선택 버튼들 */}
        <div className="flex-1 grid grid-cols-12 gap-4">
          {months.map((month, index) => (
            <Button
              className="transition "
              key={month}
              variant={month === selectedMonth ? "default" : "ghost"}
              size="sm"
              onClick={() => onMonthChange(month)}>
              <span>{month}월</span>
            </Button>
          ))}
        </div>

        {/* 월 네비게이션 - 다음 달 */}

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
        {/* 년도 및 월 네비게이션 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handlePreviousMonth}>
            <ChevronLeft />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}>
              <Button
                variant="ghost"
                onClick={handleOpenDatePicker}>
                {year}년
              </Button>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>

        {/* 월 선택 버튼들 - 모바일 최적화 */}
        <div className="grid grid-cols-6 gap-3">
          {months.map((month, index) => (
            <Button
              className="transition "
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
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />

            {/* DatePicker Modal */}
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border p-6 min-w-[400px]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}>
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">날짜 선택</h3>
                  <p className="text-sm text-muted-foreground">원하는 년도와 월을 선택해주세요</p>
                </div>

                {/* Year Selection */}
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

                {/* Month Selection */}
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

                {/* Actions */}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

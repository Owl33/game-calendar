import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "motion/react"

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
    <motion.div
      className="flex items-center gap-4 mb-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      {/* 연도 네비게이션 */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onYearChange?.(year - 1)}>
          <motion.div
            whileHover={{ x: -2 }}
            transition={{ duration: 0.2 }}>
            <ChevronLeft />
          </motion.div>
        </Button>
      </motion.div>

      <div className="min-w-[80px]">
        <AnimatePresence mode="wait">
          <motion.h2
            key={year}
            className="font-bold text-lg text-foreground tracking-tight"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}>
            {year}년
          </motion.h2>
        </AnimatePresence>
      </div>

      {/* 월 선택 버튼들 */}
      <div className="flex-1 grid grid-cols-6 lg:grid-cols-12 gap-4">
        {months.map((month, index) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}>
            <Button
              variant={month === selectedMonth ? "default" : "ghost"}
              size="sm"
              onClick={() => onMonthChange(month)}
              className={cn(
                "font-semibold h-8 text-xs w-full relative overflow-hidden",
                month === selectedMonth
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
                  : ""
              )}>
              <motion.span
                animate={month === selectedMonth ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 0.3 }}>
                {month}월
              </motion.span>
              {month === selectedMonth && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onYearChange?.(year + 1)}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}>
            <ChevronRight />
          </motion.div>
        </Button>
      </motion.div>
    </motion.div>
  );
}

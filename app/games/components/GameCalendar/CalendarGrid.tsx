import { CalendarDay } from "./CalendarDay";
import { GamesByDate } from "../../types/game.types";
import { motion, AnimatePresence } from "motion/react";

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
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}>
      {/* 요일 헤더 */}
      <motion.div
        className="grid grid-cols-7 text-center font-semibold text-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}>
        {weekDays.map((weekDay, index) => (
          <motion.div
            key={index}
            className={`py-2 text-muted-foreground ${weekDay.className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            whileHover={{ scale: 1.1, y: -2 }}>
            {weekDay.name}
          </motion.div>
        ))}
      </motion.div>

      {/* 날짜 그리드 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          className="grid grid-cols-7 gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}>
          {/* 빈 칸 (월 시작 전) */}
          {Array.from({ length: firstDay }).map((_, index) => (
            <motion.div
              key={`empty-${index}`}
              className="h-32 rounded-xl bg-muted/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.01, duration: 0.25 }}
            />
          ))}

          {/* 실제 날짜들 */}
          {Array.from({ length: lastDay }, (_, index) => index + 1).map((day) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                delay: (firstDay + day - 1) * 0.008,
                duration: 0.25,
                ease: "easeOut",
              }}
              layout>
              <CalendarDay
                day={day}
                games={gamesByDate[day] || []}
                isSelected={selectedDay === day}
                onClick={() => onDaySelect(selectedDay === day ? null : day)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

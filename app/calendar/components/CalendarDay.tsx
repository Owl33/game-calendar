/**
 * CalendarDay - 캘린더 개별 날짜 셀
 */

"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Game } from "@/types/game.types";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { FadeSlide } from "@/components/motion/FadeSlide";
import { isAAAgame, getGenreColor } from "@/utils/game";

interface CalendarDayProps {
  day: number;
  games: Game[];
  isSelected: boolean;
  onClick: () => void;
  maxDisplayGames?: number;
}

export function CalendarDay({
  day,
  games,
  isSelected,
  onClick,
  maxDisplayGames = 2,
}: CalendarDayProps) {
  const hasGames = games.length > 0;
  const displayGames = games.slice(0, maxDisplayGames);
  const [isHovered, setIsHovered] = useState(false);

  const hoverContent = hasGames ? (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: -4, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute min-w-48 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
      <Sheet className="p-3">
        <p className="font-semibold text-sm mb-1">이 날의 게임 ({games.length}개)</p>
        {games.slice(0, 5).map((game) => (
          <div
            key={game.gameId}
            className="flex items-center gap-1 py-0.5">
            <div
              className={cn("min-w-[3px] h-3", isAAAgame(game) ? "bg-highlight" : "bg-info")}
            />
            <span className="text-sm font-medium truncate">{game.name}</span>
          </div>
        ))}
        {games.length > 5 && (
          <p className="text-xs text-muted-foreground">...그리고 {games.length - 5}개 더</p>
        )}
      </Sheet>
    </motion.div>
  ) : null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <InteractiveCard
        className={cn(
          "h-32 p-3 relative overflow-hidden rounded-2xl",
          hasGames ? "bg-card calendar-card cursor-pointer" : "bg-card/30 opacity-60",
          isSelected && ["ring-2 ring-primary ring-offset-2 ring-offset-background"]
        )}
        initialY={0}
        initialScale={1}
        duration={0.15}
        hoverScale={hasGames ? 1.03 : 1}
        hoverY={hasGames ? -3 : 0}
        isActive={isSelected}
        onClick={hasGames ? onClick : undefined}>
        <div>
          {/* 헤더: 날짜와 게임 인디케이터 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "font-bold text-lg",
                  isSelected ? "text-primary font-extrabold" : "text-foreground",
                  hasGames && !isSelected && "text-accent-foreground"
                )}>
                {day}
                {hasGames && (
                  <span className="ml-1 text-xs opacity-60 font-medium">({games.length})</span>
                )}
              </p>
            </div>

            {/* 인기도 높은 게임 스타 표시 */}
            {hasGames && games.some((game) => isAAAgame(game)) && (
              <Star className="w-4 h-4 text-highlight fill-highlight" />
            )}
          </div>

          {/* 게임 정보 */}
          {hasGames ? (
            <div className="space-y-0">
              {displayGames.map((game, index) => (
                <div
                  key={game.gameId}
                  className="flex items-center gap-1 py-0.5">
                  <div
                    className={cn(
                      "min-w-[3px] h-3",
                      isAAAgame(game) ? "bg-highlight" : "bg-info"
                    )}
                  />
                  <span className="text-sm font-medium truncate">{game.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </InteractiveCard>

      <AnimatePresence>{isHovered && hoverContent}</AnimatePresence>
    </div>
  );
}

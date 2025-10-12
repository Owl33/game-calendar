/**
 * CalendarDay - 캘린더 개별 날짜 셀
 */

"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Game } from "@/types/game.types";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { isAAAgame } from "@/utils/game";

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
  maxDisplayGames = 3,
}: CalendarDayProps) {
  const hasGames = games.length > 0;
  const displayGames = games.slice(0, maxDisplayGames);
  const [isHovered, setIsHovered] = useState(false);

  const hoverContent = hasGames ? (
    <div
      className={cn(
        "absolute min-w-48 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50",
        "transition-all duration-150 ease-out",
        isHovered
          ? "opacity-100 -translate-y-1 scale-100"
          : "opacity-0 translate-y-[-10px] scale-90 pointer-events-none"
      )}>
      <Sheet className="p-3">
        <p className="font-semibold text-sm mb-1">이 날의 게임 ({games.length}개)</p>

        {games.slice(0, 5).map((game) => (
          <div
            key={game.gameId}
            className="flex items-center gap-1 py-1">
            <div className={cn("min-w-[3px] h-3", isAAAgame(game) ? "bg-highlight" : "bg-info")} />
            <span className="text-sm font-medium truncate">{game.name}</span>
          </div>
        ))}
        {games.length > 5 && (
          <div className="flex items-center gap-1 py-0.5">
            <div className={cn("min-w-[3px] h-3", "bg-info")} />
            <span className="text-sm font-medium truncate">+ {games.length - 5}개 더</span>
          </div>
        )}
      </Sheet>
    </div>
  ) : null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <InteractiveCard
        className={cn(
          "h-30 p-3 relative overflow-hidden rounded-2xl",
          hasGames ? "bg-card  cursor-pointer" : "bg-card/60 opacity-60",
          isSelected && ["ring-2 ring-primary ring-offset-2 ring-offset-background"]
        )}
        onClick={hasGames ? onClick : undefined}>
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
            {displayGames.map((game) => (
              <div
                key={game.gameId}
                className="flex items-center gap-1 py-0.5">
                <div
                  className={cn("min-w-[3px] h-3", isAAAgame(game) ? "bg-highlight" : "bg-info")}
                />
                <span className="text-sm font-medium truncate">{game.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div></div>
        )}
      </InteractiveCard>

      {hoverContent}
    </div>
  );
}

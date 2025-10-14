/**
 * CalendarDay - 캘린더 개별 날짜 셀 (수정 버전)
 */

"use client";

import { useState, useRef, useLayoutEffect } from "react";
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
}

/** 셀 높이에 따른 폰트 크기 매핑(클래스는 Tailwind 유효 값만 사용) */
function getFontSizeClasses(cardHeight: number): {
  daySize: string;
  gameSize: string;
  countSize: string;
} {
  // 0~119: 매우 작음, 120~239: 보통, 240 이상: 큼  (일관된 구간)
  if (cardHeight >= 240) {
    return {
      daySize: "text-3xl", // 크다
      gameSize: "text-xl",
      countSize: "text-base",
    };
  } else {
    return {
      daySize: "text-lg", // 보통
      gameSize: "text-sm",
      countSize: "text-xs",
    };
  }
}

/** 셀 높이에 따라 표시 가능한 게임 수 계산 (안전가드 포함) */
function calculateMaxGames(cardElement: HTMLDivElement): number {
  const totalHeight = cardElement.offsetHeight || 0;

  // 헤더를 data-attribute로 찾도록 변경 (클래스 체인 의존 제거)
  const headerElement = cardElement.querySelector(
    "[data-calendar-day-header]"
  ) as HTMLElement | null;

  const headerHeight = headerElement?.offsetHeight ?? 32;

  // 폰트 크기를 간접 반영: 높이에 따른 라인 높이 가정
  let ITEM_LINE_HEIGHT = 18;
  if (totalHeight >= 240) ITEM_LINE_HEIGHT = 28;
  else if (totalHeight >= 120) ITEM_LINE_HEIGHT = 20;

  const V_PADDING = 24; // p-3 수직 합산
  const SAFETY_MARGIN = 16; // 하단 여유
  const AVAILABLE = Math.max(0, totalHeight - headerHeight - V_PADDING - SAFETY_MARGIN);

  const maxGames = Math.floor(AVAILABLE / ITEM_LINE_HEIGHT);

  // 공간 없으면 0개, 최대 15개로 안전 제한
  return Math.max(0, Math.min(15, maxGames));
}

export function CalendarDay({ day, games, isSelected, onClick }: CalendarDayProps) {
  const hasGames = games.length > 0;
  const [isHovered, setIsHovered] = useState(false);

  // InteractiveCard가 ref를 DOM으로 포워딩하지 않을 수 있으므로
  // 바깥에 측정용 래퍼 div를 두고 ref는 여기에 단다.
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [maxDisplayGames, setMaxDisplayGames] = useState(0);
  const [fontSizes, setFontSizes] = useState(() => getFontSizeClasses(120));

  // 레이아웃 측정은 useLayoutEffect + rAF + ResizeObserver 조합으로 안정화
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let frame = 0;
    let ro: ResizeObserver | null = null;

    const measure = () => {
      const height = el.offsetHeight || 0;
      setFontSizes(getFontSizeClasses(height));
      setMaxDisplayGames(calculateMaxGames(el));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    // 초기 측정
    schedule();

    // 크기 변화 감지
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(schedule);
      ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro?.disconnect();
    };
  }, [games]);

  const displayGames = games.slice(0, maxDisplayGames);

  const hoverContent = hasGames ? (
    <div
      className={cn(
        "absolute min-w-48 bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100]",
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
            <div className="min-w-[3px] h-3 bg-info" />
            <span className="text-sm font-medium truncate">+ {games.length - 5}개 더</span>
          </div>
        )}
      </Sheet>
    </div>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <InteractiveCard
        className={cn(
          "p-3 relative overflow-hidden rounded-2xl w-full h-full flex flex-col",
          hasGames ? "bg-card cursor-pointer" : "bg-card/60 opacity-60",
          isSelected && ["ring-2 ring-primary ring-offset-2 ring-offset-background"]
        )}
        onClick={hasGames ? onClick : undefined}>
        {/* 헤더 (data-attribute로 식별) */}
        <div
          data-calendar-day-header
          className="flex items-center pb-1 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-bold",
                fontSizes.daySize,
                isSelected ? "text-primary font-extrabold" : "text-foreground",
                hasGames && !isSelected && "text-accent-foreground"
              )}>
              {day}
              {hasGames && (
                <span className={cn("ml-1 opacity-60 font-medium", fontSizes.countSize)}>
                  ({games.length})
                </span>
              )}
            </p>
          </div>

          {/* 인기도 높은 게임 스타 표시 */}
          {hasGames && games.some((g) => isAAAgame(g)) && (
            <Star className="w-4 h-4 text-highlight fill-highlight" />
          )}
        </div>

        {/* 게임 목록 */}
        {hasGames ? (
          <div className="space-y-0 overflow-hidden flex-1 min-h-0">
            {displayGames.map((game) => (
              <div
                key={game.gameId}
                className="flex items-center gap-1 py-0.5">
                <div
                  className={cn("min-w-[3px] h-3", isAAAgame(game) ? "bg-highlight" : "bg-info")}
                />
                <span className={cn(fontSizes.gameSize, "font-medium truncate")}>{game.name}</span>
              </div>
            ))}
          </div>
        ) : null}
      </InteractiveCard>

      {hoverContent}
    </div>
  );
}

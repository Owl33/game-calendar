/**
 * CalendarDay - 캘린더 개별 날짜 셀
 */

"use client";

import { useState, useRef, useEffect } from "react";
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

/** 카드(셀) 전체 높이에 따라 폰트 크기 구간 결정 */
function getFontSizeClasses(cardHeight: number): {
  daySize: string;
  gameSize: string;
  countSize: string;
  lineHeightPx: number; // 리스트 아이템 라인 높이(px) 반환 (게임명 한 줄의 총 라인 높이)
} {
  // 0~119: 작음, 120~239: 중간, 240+: 큼
  if (cardHeight >= 240) {
    // text-xl 가독성 기준 라인 높이
    return {
      daySize: "text-3xl",
      gameSize: "text-xl",
      countSize: "text-base",
      lineHeightPx: 32,
    };
  } else if (cardHeight >= 120) {
    return {
      daySize: "text-lg",
      gameSize: "text-sm",
      countSize: "text-xs",
      lineHeightPx: 24,
    };
  } else {
    // 아주 작은 셀
    return {
      daySize: "text-lg",
      gameSize: "text-sm",
      countSize: "text-xs",
      lineHeightPx: 22,
    };
  }
}

export function CalendarDay({ day, games, isSelected, onClick }: CalendarDayProps) {
  const hasGames = games.length > 0;

  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [maxDisplayGames, setMaxDisplayGames] = useState(0);
  const [fontSizes, setFontSizes] = useState(() =>
    getFontSizeClasses(0)
  );

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      // rAF로 합쳐서 깜빡임 최소화
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = cardRef.current;
        const content = contentRef.current;
        if (!card || !content) return;

        const cardH = card.clientHeight;
        const sizes = getFontSizeClasses(cardH);

        // 리스트 영역의 실제 사용 가능 높이만으로 계산
        const contentH = content.clientHeight;
        const max = Math.floor(contentH / sizes.lineHeightPx);

        setFontSizes(sizes);
        setMaxDisplayGames(Math.max(0, Math.min(15, max)));
      });
    };

    // 초기 측정
    measure();

    // 크기 변화 감지
    const cardObserver = new ResizeObserver(measure);
    const contentObserver = new ResizeObserver(measure);

    if (cardRef.current) cardObserver.observe(cardRef.current);
    if (contentRef.current) contentObserver.observe(contentRef.current);

    // games가 바뀌면(내용이 길어져 줄바꿈/랩핑 변화 가능) 재측정
    // 또한 hover 등으로 스크롤바 유무가 달라질 수 있으니 재측정
    // 여기서는 games 길이/이름 등이 바뀌었을 때만 의존
    // (내용이 매우 잦게 바뀐다면 디바운스 고려)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const contentLenKey = games.length;

    // 즉시 한 번 더
    measure();

    return () => {
      cancelAnimationFrame(raf);
      cardObserver.disconnect();
      contentObserver.disconnect();
    };
  }, [games]);

  const displayGames = games.slice(0, maxDisplayGames);

  const hoverContent = hasGames ? (
    <div
      className={cn(
        "absolute min-w-48 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-[100]",
        "transition-all duration-150 ease-out",
        isHovered
          ? "opacity-100 -translate-y-1 scale-100"
          : "opacity-0 translate-y-[-10px] scale-90 pointer-events-none"
      )}
    >
      <Sheet className="p-3">
        <p className="font-semibold text-sm mb-1">이 날의 게임 ({games.length}개)</p>

        {games.slice(0, 5).map((game) => (
          <div key={game.gameId} className="flex items-center gap-1 py-1">
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
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <InteractiveCard
        ref={cardRef}
        className={cn(
          "p-3 relative overflow-hidden rounded-2xl w-full h-full flex flex-col",
          hasGames ? "bg-card cursor-pointer" : "bg-card/60 opacity-60",
          isSelected && ["ring-2 ring-primary ring-offset-2 ring-offset-background"]
        )}
        onClick={hasGames ? onClick : undefined}
      >
        {/* 헤더: 날짜와 게임 인디케이터 (고정 높이 영역) */}
        <div className="flex items-center pb-1 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-bold",
                fontSizes.daySize,
                isSelected ? "text-primary font-extrabold" : "text-foreground",
                hasGames && !isSelected && "text-accent-foreground"
              )}
            >
              {day}
              {hasGames && (
                <span className={cn("ml-1 opacity-60 font-medium", fontSizes.countSize)}>
                  ({games.length})
                </span>
              )}
            </p>
          </div>

          {hasGames && games.some((g) => isAAAgame(g)) && (
            <Star className="w-4 h-4 text-highlight fill-highlight" />
          )}
        </div>

        {/* 리스트: flex-1 영역의 실제 높이만을 기준으로 max 표시 수 계산 */}
        {hasGames ? (
          <div ref={contentRef} className="space-y-0 overflow-hidden flex-1 min-h-0">
            {displayGames.map((game) => (
              <div key={game.gameId} className="flex items-center gap-1 py-0.5">
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

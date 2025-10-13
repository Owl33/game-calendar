/**
 * GameList - 게임 목록 (Virtuoso 가상 스크롤링)
 */

"use client";

import { memo, useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { Virtuoso } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { GameCard } from "./GameCard";
import { GameCarouselList } from "./GameCarouselList";
import { EmblaOptionsType } from "embla-carousel";

interface GameListProps {
  games: {
    gameId: number;
    name: string;
    releaseDate: Date | string;
    popularityScore: number;
    headerImage: string | null;
    genres: string[];
    platforms: string[];
    currentPrice: number | null;
    releaseDateRaw: string | null;
    comingSoon: boolean;
    gameType: string;
    isFree: boolean;
    releaseStatus: string | null;
  }[];
  isLoading: boolean;
  sorted?: boolean;
  className?: string;
  isHeader?: boolean;
  viewMode?: "card" | "list";
  sortBy?: string;
  layoutMode?: "split" | "list-only";
  mode?: "vertical" | "horizontal";
  scrollKey?: string;
}

// 반응형 그리드 - 한 행에 들어갈 카드 수 계산
function useItemsPerRow() {
  const [itemsPerRow, setItemsPerRow] = useState(3);

  useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerRow(1); // sm 미만
      } else if (width < 1280) {
        setItemsPerRow(2); // sm ~ xl 미만
      } else {
        setItemsPerRow(3); // xl 이상
      }
    };

    updateItemsPerRow();
    window.addEventListener("resize", updateItemsPerRow);
    return () => window.removeEventListener("resize", updateItemsPerRow);
  }, []);

  return itemsPerRow;
}

export const GameList = memo(function GameList({
  games,
  isLoading,
  className,
  viewMode,
  mode = "vertical",
}: GameListProps) {
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  };

  const itemsPerRow = useItemsPerRow();

  // 게임을 행 단위로 그룹화
  const gameRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < games.length; i += itemsPerRow) {
      rows.push(games.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [games, itemsPerRow]);

  // 로딩 중이거나 데이터가 없는 경우
  if (isLoading) return <LoadingSkeleton />;
  if (games.length === 0) return <EmptyState />;

  // Horizontal 모드는 캐러셀 사용
  if (mode === "horizontal") {
    return (
      <motion.div
        initial={false}
        className={cn("", className)}>
        <GameCarouselList
          games={games}
          options={OPTIONS}
        />
      </motion.div>
    );
  }

  // Vertical 모드 - Virtuoso 가상 스크롤링 (행 단위)
  return (
    <Virtuoso
      data={gameRows}
      useWindowScroll
      overscan={200}
      increaseViewportBy={{ top: 200, bottom: 600 }}
      itemContent={(rowIndex, gameRow) => (
        <div className={cn("grid gap-4", className)} key={`row-${rowIndex}`}>
          {gameRow.map((game, colIndex) => {
            const absoluteIndex = rowIndex * itemsPerRow + colIndex;
            return (
              <GameCard
                key={game.gameId}
                game={game}
                priority={absoluteIndex < 6}
                viewMode={viewMode}
                index={absoluteIndex}
                disableAnimation={true}
              />
            );
          })}
        </div>
      )}
    />
  );
});

/**
 * GameList - 게임 목록
 */

"use client";

import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
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
  sortBy?: string;
  layoutMode?: "split" | "list-only";
  mode?: "vertical" | "horizontal";
  scrollKey?: string;
}

export const GameList = memo(function GameList({
  games,
  isLoading,
  className,
  mode = "vertical",
  scrollKey,
}: GameListProps) {
  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  };

  const listRef = useRef<HTMLDivElement>(null);

  // scrollKey 변경 시 맨 위로 스크롤
  useEffect(() => {
    if (scrollKey && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollKey]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            key={scrollKey}
            ref={listRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn("", className)}>
            {mode === "horizontal" ? (
              <GameCarouselList
                games={games}
                options={OPTIONS}
              />
            ) : (
              games.map((game, index) => {
                return (
                  <GameCard
                    key={game.gameId}
                    game={game}
                    priority={index < 6}
                    index={index}
                    disableAnimation
                  />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

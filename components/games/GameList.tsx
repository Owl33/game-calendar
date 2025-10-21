/**
 * GameList - 게임 목록
 */

"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
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

  const skeletonGames = useMemo(() => {
    const count = mode === "horizontal" ? 5 : 6;
    return Array.from({ length: count }, (_, index) => ({
      gameId: -index - 1,
      name: `loading-${index}`,
      releaseDate: new Date(),
      popularityScore: 0,
      headerImage: "",
      genres: [] as string[],
      platforms: [] as string[],
      currentPrice: null,
      releaseDateRaw: null,
      comingSoon: false,
      gameType: "",
      isFree: false,
      releaseStatus: null,
    }));
  }, [mode]);

  const shouldShowEmpty = !isLoading && games.length === 0;
  const displayGames = isLoading ? skeletonGames : games;

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn("", className)}>
            {mode === "horizontal" ? (
              <GameCarouselList
                games={displayGames}
                options={OPTIONS}
                isLoading
              />
            ) : (
              displayGames.map((game, index) => {
                return (
                  <GameCard
                    key={`loading-${index}`}
                    game={game}
                    priority={false}
                    index={index}
                    disableAnimation
                    isLoading
                  />
                );
              })
            )}
          </motion.div>
        ) : shouldShowEmpty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn("", className)}>
            <EmptyState />
          </motion.div>
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
                games={displayGames}
                options={OPTIONS}
              />
            ) : (
              displayGames.map((game, index) => {
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

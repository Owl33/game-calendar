/**
 * GameList - 게임 목록
 */

"use client";

import { useEffect, useRef } from "react";
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
  viewMode?: "card" | "list";
  sortBy?: string;
  layoutMode?: "split" | "list-only";
  mode?: "vertical" | "horizontal";
}

export function GameList({
  games,
  isLoading,
  className,
  sortBy,
  viewMode,
  mode = "vertical",
}: GameListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // 레이아웃 적용 직후 스크롤
    requestAnimationFrame(() => {
      // 즉시
      el.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [games, sortBy, viewMode]); // ← viewMode 제거

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            ref={listRef}
            // 전체 컨테이너는 초기 페이드 없이
            initial={false}
            // 컨테이너 레이아웃 애니메이션 (필요 시)
            layout
            transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
            className={cn("", className)}>
            {mode == "horizontal" ? (
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
                    priority={index < 4}
                    viewMode={viewMode}
                  />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

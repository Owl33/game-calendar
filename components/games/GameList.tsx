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
  viewMode?:'card'|'list',
  sortBy?: string;
  mode?: "vertical" | "horizontal";
  scrollKey?: string;
  persistScroll?: boolean;
}

export const GameList = memo(function GameList({
  games,
  isLoading,
  className,
  viewMode ='card',
  mode = "vertical",
  scrollKey,
  persistScroll = false,
}: GameListProps) {
  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  };

  const listRef = useRef<HTMLDivElement>(null);

  // scrollKey 변경 시 맨 위로 스크롤 (기존 동작 유지, 지속 스크롤 사용 시 제외)
  useEffect(() => {
    if (persistScroll) return;
    if (scrollKey && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollKey, persistScroll]);

  // 세션 단위 스크롤 위치 기억 (캘린더용)
  useEffect(() => {
    if (!persistScroll || mode !== "vertical") return;
    if (!scrollKey) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const node = listRef.current;
    if (!node) return;

    const storageKey = `game-list-scroll:${scrollKey}`;
    const restoredRef = { current: false };

    const restore = () => {
      if (restoredRef.current) return;
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        node.scrollTo({ top: Number(saved), behavior: "auto" });
      }
      restoredRef.current = true;
    };

    restore();
    const raf = requestAnimationFrame(restore);

    const save = () => {
      sessionStorage.setItem(storageKey, String(node.scrollTop));
    };

    const handleScroll = () => {
      sessionStorage.setItem(storageKey, String(node.scrollTop));
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") save();
    };

    node.addEventListener("scroll", handleScroll);
    window.addEventListener("pagehide", save);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("visibilitychange", handleVisibility);
      save();
    };
  }, [persistScroll, scrollKey, mode]);

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
                  viewMode={viewMode}
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

/**
 * GameList - 게임 목록
 */

"use client";

import { memo, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";
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
  viewMode?: "card" | "list";
  sortBy?: string;
  mode?: "vertical" | "horizontal";
  scrollKey?: string;
  persistScroll?: boolean;
  setPersistScroll?:(value:boolean)=>void;
}

export const GameList = memo(function GameList({
  games,
  isLoading,
  className,
  viewMode = "card",
  mode = "vertical",
  scrollKey,
  persistScroll = false,setPersistScroll
}: GameListProps) {
  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  const OPTIONS: EmblaOptionsType = {
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  };

  const listRef = useRef<HTMLDivElement | null>(null);
  const restoredRef = useRef(false);

  // scrollKey 변경 시 맨 위로 스크롤 (기존 동작 유지, 지속 스크롤 사용 시 제외)
  useEffect(() => {
    console.log(persistScroll)
 
    if (persistScroll) return;
    if (!persistScroll && scrollKey && listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

  }, [scrollKey, persistScroll,games]);


  const storageKey = scrollKey ? `game-list-scroll:${String(scrollKey)}` : null;

  const saveNow = useCallback(() => {
    const node = listRef.current;
    if (!node) return;
    if (!document.body.contains(node)) return;

    // 주 목적은 scrollTop 저장 (동기 API -> 네비게이션 직후에도 남음)
    if (storageKey) {

        sessionStorage.setItem(storageKey, String(node.scrollTop));
   
    }
  }, [storageKey]);

  // 세션 단위 스크롤 위치 기억
  useLayoutEffect(() => {
    if (!persistScroll || mode !== "vertical") return;
    if (!scrollKey) return;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const node = listRef.current;
    if (!node) return;

    const restore = () => {
      if (restoredRef.current) return;
      if (!storageKey) {
        restoredRef.current = true;
        return;
      }

        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          // 안전하게 숫자로 변환 후 복원
          node.scrollTo({ top: Number(saved), behavior: "auto" });
        }

      restoredRef.current = true;
    };

    restore();
    const raf = requestAnimationFrame(restore);

    const saveOnPageHide = () => {
      if (!storageKey) return;
      if (!document.body.contains(node)) return;
        sessionStorage.setItem(storageKey, String(node.scrollTop));
  
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") saveOnPageHide();
    };

    window.addEventListener("pagehide", saveOnPageHide);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pagehide", saveOnPageHide);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [persistScroll, scrollKey, mode, storageKey]);

  // skeleton 생성
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

  const handleClickCapture = (e: React.MouseEvent) => {
    if(setPersistScroll){

      setPersistScroll(true);
    }
    saveNow();
  };

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
            className={cn("", className)}
          >
            {mode === "horizontal" ? (
              <GameCarouselList games={displayGames} options={OPTIONS} isLoading />
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
            className={cn("", className)}
          >
            <EmptyState />
          </motion.div>
        ) : (
          <motion.div
            key={scrollKey}
            ref={listRef}
            onClickCapture={handleClickCapture}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn("", className)}
          >
            {mode === "horizontal" ? (
              <GameCarouselList games={displayGames} options={OPTIONS} />
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

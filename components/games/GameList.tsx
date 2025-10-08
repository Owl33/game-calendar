/**
 * GameList - 게임 목록
 */

"use client";

import { useState, useEffect, useRef, ReactElement } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { GameListHeader } from "./GameListHeader";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { GameCard } from "./GameCard";
import { Game } from "@/types/game.types";

interface GameListProps {
  games: any[];
  isLoading: boolean;
  sorted?: boolean;
  className?: string;
  isHeader?: boolean;
  viewMode?: "card" | "list";
  sortBy?: string;
  layoutMode?: "split" | "list-only";
}

export function GameList({ games, isLoading, className, sortBy, viewMode }: GameListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    // 레이아웃 적용 직후 스크롤
    requestAnimationFrame(() => {
      // 즉시
      el.scrollTo({ top: 0, behavior: "auto" });
    });
    console.log(viewMode);
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
            className={cn("grid gap-4", className)}>
            {/* 아이템들 */}
            {games.map((game, index) => (
              <motion.div
                key={game.gameId}
                // 위치 변화만 부드럽게 (사이즈까지 애니 안 하려면 "position")
                layout // 초기/퇴장/opacity/y 애니 제거 → 어색한 재진입/깜빡임 방지
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.32 }}>
                <GameCard
                  game={game}
                  priority={index < 4}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

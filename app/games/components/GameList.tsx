/**
 * GameList - 게임 목록
 */

"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { GameListHeader } from "./GameListHeader";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { GameCard } from "./GameCard";
import { Game } from "../types/game.types";

interface GameListProps {
  games: Game[];
  isLoading: boolean;
  className?: string;
  onGameClick?: (game: Game) => void;
  selectedDay?: number | null;
  layoutMode?: "split" | "list-only";
}

export function GameList({ games, isLoading, className, onGameClick, layoutMode }: GameListProps) {
  const [sortBy, setSortBy] = useState<"name" | "date" | "popularityScore">("popularityScore");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 localStorage 값 적용 (Hydration 에러 방지)
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("game-list-view-mode");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = new Date().getTime();
        if (now <= parsed.expiry) {
          setViewMode(parsed.value);
        } else {
          localStorage.removeItem("game-list-view-mode");
        }
      } catch (error) {
        console.warn("Failed to parse view mode from localStorage");
      }
    }
  }, []);

  // viewMode 변경 시 localStorage에 저장
  useEffect(() => {
    if (!mounted) return;

    const expiryMonths = 6;
    const now = new Date().getTime();
    const expiryTime = now + expiryMonths * 30 * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "game-list-view-mode",
      JSON.stringify({
        value: viewMode,
        expiry: expiryTime,
      })
    );
  }, [viewMode, mounted]);

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case "popularityScore":
        return b.popularityScore - a.popularityScore; // 높은 점수 우선
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className={className}>
      <GameListHeader
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        className="mb-4"
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "grid lg:px-4",
              viewMode === "card"
                ? layoutMode === "list-only"
                  ? "grid-cols-1 lg:grid-cols-2 gap-4"
                  : "grid-cols-1 gap-4"
                : "grid-cols-1 gap-2"
            )}>
            {sortedGames.map((game, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  layout: { duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                  y: { duration: 0.2 },
                }}>
                <GameCard
                  game={game}
                  onClick={() => onGameClick?.(game)}
                  priority={index < 4}
                  viewMode={viewMode}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

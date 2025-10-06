/**
 * GameList - 게임 목록
 */

"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FadeSlide } from "@/components/motion/FadeSlide";
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
}

export function GameList({ games, isLoading, className, onGameClick, selectedDay }: GameListProps) {
  const [sortBy, setSortBy] = useState<"name" | "date" | "added">("added");

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case "added":
        return 0;
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
        className="mb-6"
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            key={`games-${selectedDay}-${games.length}`}
            className="space-y-4">
            {sortedGames.map((game, index) => (
              <GameCard
                key={game.gameId}
                game={game}
                onClick={() => onGameClick?.(game)}
                priority={index < 4} // 첫 4개 우선 로딩
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

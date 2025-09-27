import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "../ui/GameCard";
import { GameListHeader } from "./GameListHeader";
import { Game } from "../../types/game.types";
import { useState } from "react";

interface GameListProps {
  games: Game[];
  isLoading: boolean;
  className?: string;
  onGameClick?: (game: Game) => void;
}

export function GameList({ games, isLoading, className, onGameClick }: GameListProps) {
  const [sortBy, setSortBy] = useState<"name" | "date" | "added">("added");

  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case "added":
        // 추가된 순서대로 (현재는 기본 순서)
        return 0;
      case "name":
        return a.name.localeCompare(b.name);
      case "date":
        return new Date(a.released).getTime() - new Date(b.released).getTime();

      default:
        return 0;
    }
  });

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`${className}`}>
      <GameListHeader
        sortBy={sortBy}
        onSortChange={setSortBy}
        className="mb-6"
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : games.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-6 text-6xl opacity-30">🎮</div>
          <h3 className="text-lg font-semibold mb-2">게임이 없습니다</h3>
          <p className="text-sm">이 날짜에는 출시된 게임이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGames.map((game, index) => (
            <div
              key={game.id}
              className="animate-in  fade-in duration-500"
              style={{ animationDelay: `${80}ms` }}>
              <GameCard
                game={game}
                onClick={() => onGameClick?.(game)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

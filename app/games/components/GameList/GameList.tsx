import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "../ui/GameCard";
import { GameListHeader } from "./GameListHeader";
import { Game } from "../../types/game.types";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

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
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-3 p-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}>
          <motion.div
            className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="flex-1">
            <motion.div
              className="h-4 rounded bg-gray-200 dark:bg-gray-700 mb-2"
              style={{ width: "75%" }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15,
              }}
            />
            <motion.div
              className="h-3 rounded bg-gray-200 dark:bg-gray-700"
              style={{ width: "50%" }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div className={`${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}>
        <GameListHeader
          sortBy={sortBy}
          onSortChange={setSortBy}
          className="mb-6"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSkeleton />
        ) : games.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-12 text-muted-foreground"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}>
            <motion.div
              className="w-20 h-20 mx-auto mb-6 text-6xl opacity-30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.4, type: "spring" }}>
              🎮
            </motion.div>
            <motion.h3
              className="text-lg font-semibold mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}>
              게임이 없습니다
            </motion.h3>
            <motion.p
              className="text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.2 }}>
              이 날짜에는 출시된 게임이 없습니다.
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key={`games-${selectedDay}-${games.length}`}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {sortedGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  delay: index * 0.02,
                  duration: 0.15,
                  ease: "easeOut",
                }}
                layout>
                <GameCard
                  game={game}
                  onClick={() => onGameClick?.(game)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

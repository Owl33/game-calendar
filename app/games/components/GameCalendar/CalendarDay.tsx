import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Game } from "../../types/game.types";
import { cn } from "@/lib/utils";
import { Gamepad2, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
interface CalendarDayProps {
  day: number;
  games: Game[];
  isSelected: boolean;
  onClick: () => void;
  maxDisplayGames?: number;
}

export function CalendarDay({
  day,
  games,
  isSelected,
  onClick,
  maxDisplayGames = 2,
}: CalendarDayProps) {
  const hasGames = games.length > 0;
  const displayGames = games.slice(0, maxDisplayGames);
  const extraCount = games.length - displayGames.length;

  // 게임 장르별 색상 매핑 (Apple 스타일 색상)
  const getGenreColor = (game: any) => {
    const genres = game.genres || [];
    if (genres.includes("Action")) return "bg-gradient-to-r from-red-500 to-red-600";
    if (genres.includes("RPG")) return "bg-gradient-to-r from-purple-500 to-purple-600";
    if (genres.includes("Strategy")) return "bg-gradient-to-r from-blue-500 to-blue-600";
    if (genres.includes("Adventure")) return "bg-gradient-to-r from-green-500 to-green-600";
    if (genres.includes("Indie")) return "bg-gradient-to-r from-orange-500 to-orange-600";
    if (genres.includes("Sports")) return "bg-gradient-to-r from-teal-500 to-teal-600";
    if (genres.includes("Racing")) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  // 오늘 날짜인지 확인
  const isToday = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    return day === currentDay; // 간단히 일자만 비교 (실제로는 월/년도도 확인해야 함)
  };

  // AAA급 게임인지 확인 (rating이 높거나 유명 퍼블리셔)
  const isAAAgame = (game: any) => {
    const rating = game.rating || 0;
    const publishers = game.publishers || [];
    const majorPublishers = [
      "Ubisoft",
      "Electronic Arts",
      "Activision",
      "Sony",
      "Microsoft",
      "Nintendo",
      "Rockstar",
      "CD Projekt",
    ];
    return (
      rating >= 4.0 ||
      publishers.some((pub: string) => majorPublishers.some((major) => pub.includes(major)))
    );
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverContent = hasGames ? (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-lg p-3 shadow-lg border max-w-xs">
      <div className="space-y-2">
        <div className="font-semibold text-sm">이 날의 게임 ({games.length}개)</div>
        {games.slice(0, 5).map((game: any, index: number) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.15 }}
            className="flex items-center gap-2 text-xs">
            <div className={cn("w-2 h-2 rounded-full", getGenreColor(game))} />
            <span className="truncate">{game.name}</span>
          </motion.div>
        ))}
        {games.length > 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.15 }}
            className="text-xs text-muted-foreground">
            ...그리고 {games.length - 5}개 더
          </motion.div>
        )}
      </div>
    </motion.div>
  ) : null;

  return (
    <div className="relative">
      <motion.div
        className={cn(
          "h-32 p-3 cursor-pointer relative overflow-hidden",
          "rounded-2xl",
          "shadow-[1px_1px_3px_rgba(0,0,0,0.15)]",
          "bg-white dark:bg-gray-800",
          // 선택된 날짜 스타일
          isSelected && ["ring-2 ring-primary ring-offset-2 ", "border-2 border-primary/50"],
          !hasGames && ["bg-gray-50 dark:bg-gray-900"]
        )}
        animate={
          isSelected
            ? {
                scale: 1.05,
                y: -6,
                boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
              }
            : {
                scale: 1,
                y: 0,
                boxShadow: "1px 1px 3px rgba(0,0,0,0.15)",
              }
        }
        whileHover={{
          scale: 1.05,
          y: -6,
          boxShadow: [
            "1px 1px 3px rgba(0,0,0,0.15)",
            "0 5px 15px rgba(0,0,0,0.15)",
            "0 15px 35px rgba(0,0,0,0.2)",
          ],
        }}
        whileTap={{ scale: 0.95 }}
        transition={{
          scale: { duration: 0.15, ease: "easeOut" },
          y: { duration: 0.15, ease: "easeOut" },
          boxShadow: {
            duration: 0.4,
            ease: "easeOut",
            times: [0, 0.3, 1],
          },
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* 헤더: 날짜와 게임 인디케이터 */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.span
              className={cn(
                "font-bold text-lg",
                isToday() && "text-blue-600 dark:text-blue-400",
                isSelected ? "text-primary font-extrabold" : "text-foreground",
                hasGames && !isSelected && "text-accent-foreground"
              )}
              animate={{
                scale: isToday() ? 1.1 : isSelected ? 1.05 : 1,
              }}
              transition={{ duration: 0.15 }}>
              {day}
            </motion.span>
            {isToday() && (
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>

          {/* 인기도 높은 게임 스타 표시 */}
          {hasGames && games.some((game) => isAAAgame(game)) && (
            <motion.div
              className="flex items-center"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </motion.div>
          )}

          {/* 우측 상단 게임 점들 - 더 세련되게 */}
          {hasGames && !games.some((game) => isAAAgame(game)) && (
            <div className="flex flex-wrap gap-1 max-w-[50px]">
              {games.slice(0, 3).map((game, index) => (
                <motion.div
                  key={game.id}
                  className={cn("w-2 h-2 rounded-full shadow-lg", getGenreColor(game))}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                  whileHover={{ scale: 1.25 }}
                />
              ))}
              {games.length > 3 && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                />
              )}
            </div>
          )}
        </div>

        {/* 게임 정보 */}
        <div className="">
          {hasGames ? (
            <div className="space-y-2">
              {/* 메인 게임명 표시 */}
              {displayGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  className={cn(
                    "text-xs font-semibold text-foreground truncate",
                    "p-1.5 rounded-lg backdrop-blur-sm",
                    "bg-gradient-to-r from-white/10 to-transparent",
                    "border",
                    isAAAgame(game) &&
                      "border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-transparent"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  whileHover={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
                  }}>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1 h-1 rounded-full", getGenreColor(game))} />
                    <span className="truncate">{game.name}</span>
                  </div>
                </motion.div>
              ))}

              {/* +N 표시 - 더 눈에 띄게 */}
              {extraCount > 0 && (
                <motion.div
                  className="text-xs text-muted-foreground font-medium text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}>
                  <span className="px-2 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                    +{extraCount}개 더
                  </span>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              className="flex-1 flex items-center justify-center opacity-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.15 }}>
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 opacity-40">🎮</div>
                <span className="text-xs text-muted-foreground">출시 없음</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Motion.dev로 구현한 Hover Tooltip */}
      <AnimatePresence>{isHovered && hoverContent}</AnimatePresence>
    </div>
  );
}

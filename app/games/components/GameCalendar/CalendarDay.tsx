import React from "react";
import { Sheet } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const getGenreColor = () => {
    // if (genres.includes("Action")) return "bg-gradient-to-r from-red-500 to-red-600";
    // if (genres.includes("RPG")) return "bg-gradient-to-r from-purple-500 to-purple-600";
    // if (genres.includes("Strategy")) return "bg-gradient-to-r from-blue-500 to-blue-600";
    // if (genres.includes("Adventure")) return "bg-gradient-to-r from-green-500 to-green-600";
    // if (genres.includes("Indie")) return "bg-gradient-to-r from-orange-500 to-orange-600";
    // if (genres.includes("Sports")) return "bg-gradient-to-r from-teal-500 to-teal-600";
    // if (genres.includes("Racing")) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    return "bg-gradient-to-r from-blue-500 to-blue-600";
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
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 ">
      <Sheet className="space-y-2 p-3">
        <p className="font-semibold text-sm">이 날의 게임 ({games.length}개)</p>
        {games.slice(0, 5).map((game: any, index: number) => (
          <div
            key={game.id}
            className="flex items-center gap-2 text-sm">
            <div className={cn("w-2 h-2 rounded-full", getGenreColor())} />
            <span className="truncate">{game.name}</span>
          </div>
        ))}
        {games.length > 5 && (
          <p className="text-xs text-muted-foreground">...그리고 {games.length - 5}개 더</p>
        )}
      </Sheet>
    </motion.div>
  ) : null;

  return (
    <Sheet className="relative">
      <motion.div
        className={cn(
          "h-30.5 p-3 cursor-pointer relative overflow-hidden",
          "rounded-2xl",
          "shadow-[1px_1px_3px_rgba(0,0,0,0.15)]",
          !hasGames && ["bg-gray-50 opacity-35"],
          // 선택된 날짜 스타일
          isSelected && ["ring-2 ring-primary ring-offset-2 ", "border-2 border-primary/50"]
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
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <motion.p
              className={cn(
                "font-bold text-lg",

                isSelected ? "text-primary font-extrabold" : "text-foreground",
                hasGames && !isSelected && "text-accent-foreground"
              )}
              animate={{}}
              transition={{ duration: 0.15 }}>
              {day}
              {hasGames && (
                <span className="ml-1 text-xs text-grey-300 font-medium">({games.length})</span>
              )}
            </motion.p>
          </div>

          {/* 인기도 높은 게임 스타 표시 */}
          {hasGames && games.some((game) => isAAAgame(game)) && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}

          {/* 우측 상단 게임 점들 - 더 세련되게 */}
          {hasGames && !games.some((game) => isAAAgame(game)) && (
            <div className={cn("w-2 h-2 rounded-full shadow-lg", getGenreColor())} />
          )}
        </div>

        {/* 게임 정보 */}
        {hasGames ? (
          <div className="space-y-0">
            {/* 메인 게임명 표시 */}
            {displayGames.map((game, index) => (
              <motion.div
                key={game.id}
                className={cn("text-sm font-semibold text-foreground truncate", "p-1 rounded-lg")}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}>
                <div className="flex items-center gap-1">
                  {hasGames && games.some((game) => isAAAgame(game)) ? (
                    <motion.div
                      className="flex items-center"
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  ) : (
                    <div className={cn("min-w-2 h-2 rounded-full", getGenreColor())} />
                  )}
                  <span className="truncate">{game.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            <div className="text-center">
              <div className="w-6 h-6 mx-auto mb-1 opacity-40">🎮</div>
              <span className="text-xs text-muted-foreground">출시 없음</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Motion.dev로 구현한 Hover Tooltip */}
      <AnimatePresence>{isHovered && hoverContent}</AnimatePresence>
    </Sheet>
  );
}

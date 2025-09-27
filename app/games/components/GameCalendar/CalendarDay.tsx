import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Game } from "../../types/game.types";
import { cn } from "@/lib/utils";
import { Gamepad2, Star } from "lucide-react";

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

  const tooltipContent = hasGames ? (
    <div className="space-y-2 max-w-xs">
      <div className="font-semibold text-sm">이 날의 게임 ({games.length}개)</div>
      {games.slice(0, 5).map((game: any) => (
        <div
          key={game.id}
          className="flex items-center gap-2 text-xs">
          <div className={cn("w-2 h-2 rounded-full", getGenreColor(game))} />
          <span className="truncate">{game.name}</span>
        </div>
      ))}
      {games.length > 5 && (
        <div className="text-xs text-muted-foreground">...그리고 {games.length - 5}개 더</div>
      )}
    </div>
  ) : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "h-32 p-3 cursor-pointer transition-all duration-500 ease-out transform relative overflow-hidden",
              " rounded-2xl backdrop-blur-xl",
              "shadow-[1px_1px_3px_rgba(0,0,0,0.15)]",
              // Apple 스타일 glassmorphism 배경
              // 호버 효과
              "hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:scale-[1.03] hover:-translate-y-1",
              "hover:bg-gradient-to-br hover:from-white/15 hover:via-white/8 hover:to-white/5",
              // 게임이 있는 날 스타일

              // 선택된 날짜 스타일
              isSelected && [
                "ring-2 ring-primary/70 ring-offset-2 ring-offset-background",
                "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/8",
                "shadow-[0_20px_60px_rgba(0,0,0,0.15)] scale-[1.03] -translate-y-1",
                "bg-gradient-to-br from-white/15 via-white/8 to-white/5",
              ],
              !hasGames && ["bg-gray-50"]
            )}
            onClick={onClick}>
            {/* 헤더: 날짜와 게임 인디케이터 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "font-bold text-lg transition-all duration-300",
                    isToday() && "text-blue-600 dark:text-blue-400 scale-110",
                    isSelected ? "text-primary scale-105" : "text-foreground",
                    hasGames && "text-accent-foreground"
                  )}>
                  {day}
                </span>
                {isToday() && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
              </div>

              {/* 인기도 높은 게임 스타 표시 */}
              {hasGames && games.some((game) => isAAAgame(game)) && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                </div>
              )}

              {/* 우측 상단 게임 점들 - 더 세련되게 */}
              {hasGames && !games.some((game) => isAAAgame(game)) && (
                <div className="flex flex-wrap gap-1 max-w-[50px]">
                  {games.slice(0, 3).map((game, index) => (
                    <div
                      key={game.id}
                      className={cn(
                        "w-2 h-2 rounded-full shadow-lg",
                        getGenreColor(game),
                        "animate-in fade-in zoom-in duration-500",
                        "hover:scale-125 transition-transform"
                      )}
                      style={{ animationDelay: `${index * 120}ms` }}
                      title={game.name}
                    />
                  ))}
                  {games.length > 3 && (
                    <div
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg animate-in fade-in zoom-in duration-500"
                      style={{ animationDelay: "360ms" }}
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
                    <div
                      key={game.id}
                      className={cn(
                        "text-xs font-semibold text-foreground truncate",
                        "p-1.5 rounded-lg backdrop-blur-sm",
                        "bg-gradient-to-r from-white/10 to-transparent",
                        "border",
                        "animate-in slide-in-from-left-2 fade-in duration-500",
                        "hover:bg-gradient-to-r hover:from-white/20 hover:to-white/5 transition-all",
                        isAAAgame(game) &&
                          "border-yellow-400/30 bg-gradient-to-r from-yellow-500/10 to-transparent"
                      )}
                      style={{ animationDelay: `${index * 150}ms` }}
                      title={game.name}>
                      <div className="flex items-center gap-1">
                        <div className={cn("w-1 h-1 rounded-full", getGenreColor(game))} />
                        <span className="truncate">{game.name}</span>
                      </div>
                    </div>
                  ))}

                  {/* +N 표시 - 더 눈에 띄게 */}
                  {extraCount > 0 && (
                    <div className="text-xs text-muted-foreground font-medium text-center">
                      <span className="px-2 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20">
                        +{extraCount}개 더
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center opacity-30">
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto mb-1 opacity-40">🎮</div>
                    <span className="text-xs text-muted-foreground">출시 없음</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent
            side="top"
            className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

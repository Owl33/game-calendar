import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Game } from "@/app/games/types/game.types";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, Monitor, Gamepad2, Smartphone, Clock } from "lucide-react";
import { InteractiveCard } from "@/components/motion/InteractiveCard";
import { FadeSlide } from "@/components/motion/FadeSlide";
import {
  isAAAgame,
  getDaysUntilRelease,
  normalizePlatforms,
  getPlatformIconType,
} from "@/utils/game";

interface GameCardProps {
  game: Game;
  className?: string;
  onClick?: () => void;
  priority?: boolean; // 이미지 로딩 우선순위
}
import Steam from "@/public/icon/steam.png";
import Xbox from "@/public/icon/xbox.png";
import Nintendo from "@/public/icon/nintendo.png";
import Psn from "@/public/icon/psn.png";
export function GameCard({ game, className, onClick, priority = false }: GameCardProps) {
  const gameData = game as any;

  const daysUntilRelease = getDaysUntilRelease(gameData.releaseDate);
  const isUpcoming = daysUntilRelease > 0;
  const isToday = daysUntilRelease === 0;
  function formatNumber(n?: number | null) {
    if (n === null || n === undefined) return "데이터 없음";
    return new Intl.NumberFormat("ko-KR").format(n);
  }
  function findLogo(store: string) {
    switch (store) {
      case "steam":
        return Steam;
      case "psn":
        return Psn;
      case "playstation":
        return Psn;
      case "xbox":
        return Xbox;
      case "nintendo":
        return Nintendo;
      default:
        return Steam;
    }
  }

  return (
    <Link
      href={`/games/${gameData.gameId}`}
      prefetch={true}
      className="block"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}>
      <InteractiveCard
        className={cn(
          "cursor-pointer group overflow-hidden relative rounded-xl bg-card elevated-card",
          className
        )}
        hoverScale={1.03}
        hoverY={-4}
        hoverRotateX={3}
        hoverRotateY={5}
        preserve3d>
        <div className="flex flex-col gap-4 relative z-10">
          {/* 게임 이미지 */}
          <div className="w-full overflow-hidden rounded-t-lg bg-black/95">
            <AspectRatio ratio={16 / 9}>
              <Image
                fill
                src={gameData.headerImage}
                alt={gameData.name}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-fit"
                loading={priority ? undefined : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNhYWFhYWE7c3RvcC1vcGFjaXR5OjAuMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzcwNzA3MDtzdG9wLW9wYWNpdHk6MC4yIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9InVybCgjZykiLz48L3N2Zz4="
              />
            </AspectRatio>
          </div>

          {/* 게임 정보 */}
          <div className="px-4 pb-4 flex-1 min-w-0 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-bold text-2xl text-foreground line-clamp-1">{gameData.name}</h3>
                {isAAAgame(gameData) && (
                  <Badge className="px-2 py-1 gradient-aaa-badge text-white text-sm font-bold border-0 shadow-lg">
                    인기작
                  </Badge>
                )}
              </div>

              {/* 출시일과 상태 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={cn(
                      "font-medium text-foreground",
                      isToday && "text-success font-bold",
                      isUpcoming && "text-info"
                    )}>
                    {new Date(gameData.releaseDate).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                {/* 출시 상태 배지 */}
                {isToday && (
                  <Badge className="px-2 py-1 gradient-today-badge text-white text-xs shadow-lg">
                    오늘 출시!
                  </Badge>
                )}
                {isUpcoming && daysUntilRelease <= 7 && (
                  <Badge className="px-2 py-1 gradient-upcoming-badge text-white text-xs shadow-lg">
                    <Clock className="w-3 h-3 mr-1" />
                    {daysUntilRelease}일 후
                  </Badge>
                )}
              </div>
            </div>

            {/* 장르 및 플랫폼 */}
            <div className="space-y-3">
              {/* 장르 */}
              {gameData.genres && gameData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gameData.genres.slice(0, 5).map((genre: string, index: number) => (
                    <Badge
                      variant="secondary"
                      key={genre}
                      className={cn("text-xs px-3 py-1 font-semibold", "border")}>
                      {genre}
                    </Badge>
                  ))}
                  {gameData.genres.length > 5 && (
                    <Badge className="text-xs px-3 py-1 bg-muted text-muted-foreground border-0">
                      +{gameData.genres.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              {/* 개발사와 가격 */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">
                    {gameData?.currentPrice
                      ? `₩ ${formatNumber(gameData.currentPrice)}`
                      : "가격 정보 없음"}
                  </p>
                </div>
                {/* 플랫폼 */}
                {gameData.platforms && gameData.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {gameData.platforms.map((platform: string, index: number) => {
                      return (
                        <Image
                          key={platform}
                          src={findLogo(platform)}
                          alt={platform}
                          width={18}
                          height={18}></Image>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </InteractiveCard>
    </Link>
  );
}

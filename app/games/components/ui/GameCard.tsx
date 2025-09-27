import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Game } from "../../types/game.types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  DollarSign,
  Monitor,
  Gamepad2,
  Smartphone,
  Star,
  Sparkles,
  Clock,
} from "lucide-react";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { platform } from "os";

interface GameCardProps {
  game: Game;
  className?: string;
  onClick?: () => void;
}

export function GameCard({ game, className, onClick }: GameCardProps) {
  const gameData = game as any; // 타입을 any로 캐스팅하여 추가 속성 접근

  // AAA급 게임인지 확인
  const isAAAgame = () => {
    const rating = gameData.rating || 0;
    const publishers = gameData.publishers || [];
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

  // 출시일까지 남은 일수 계산
  const getDaysUntilRelease = () => {
    const releaseDate = new Date(gameData.released);
    const today = new Date();
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilRelease = getDaysUntilRelease();
  const isUpcoming = daysUntilRelease > 0;
  const isToday = daysUntilRelease === 0;

  // 플랫폼별 아이콘 매핑
  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes("pc")) return Monitor;
    if (
      platformLower.includes("playstation") ||
      platformLower.includes("xbox") ||
      platformLower.includes("nintendo")
    )
      return Gamepad2;
    if (
      platformLower.includes("mobile") ||
      platformLower.includes("ios") ||
      platformLower.includes("android")
    )
      return Smartphone;
    return Monitor; // 기본값
  };
  const normalizePlatforms = (platforms: any[]) => {
    return Array.from(
      new Set(
        (platforms ?? []).map((p) => {
          if (p.toLowerCase().includes("playstation")) return "PS";
          if (p.toLowerCase().includes("xbox")) return "Xbox";
          if (p.toLowerCase().includes("nintendo")) return "Nintendo";
          if (["pc", "macos", "linux"].some((os) => p.toLowerCase().includes(os))) return "PC";

          return p; // 매핑 안 되면 원래 slug 유지
        })
      )
    );
  };
  // console.log(normalizePlatforms(gameData.platforms));
  return (
    <div
      className={cn(
        " transition-all duration-500 ease-out transform cursor-pointer group overflow-hidden relative rounded-xl",
        "shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
        // Apple 스타일 glassmorphism 베이스
        // 호버 효과
        "hover:shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:scale-[1.03] hover:-translate-y-1",
        "hover:bg-gradient-to-br hover:from-white/15 hover:via-white/8 hover:to-white/5",
        // AAA급 게임 특별 스타일
        // 출시일 기반 스타일
        className
      )}
      onClick={onClick}>
      {/* 배경 그라디언트 오버레이 */}

      <div className=" flex flex-col gap-4 relative z-10">
        {/* 게임 이미지 - 더 큰 사이즈와 시각적 효과 */}
        <div className="lg:h-64 sm:h-84 w-full relative">
          <Image
            fill
            src={gameData.image}
            alt={gameData.name}
            priority={true}
            sizes="w-full"
            className="h-full w-full rounded-t-lg"></Image>
        </div>

        {/* 게임 정보 */}
        <div className="px-4 pb-4 flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="mb-4 font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {gameData.name}
            </h3>

            {/* 출시일과 상태 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "font-medium",
                    isToday && "text-green-600 font-bold",
                    isUpcoming && "text-blue-600"
                  )}>
                  {new Date(gameData.released).toLocaleDateString("ko-KR")}
                </span>
              </div>
              {isAAAgame() && (
                <Badge className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold border-0">
                  기대작
                </Badge>
              )}
              {/* 출시 상태 배지 */}
              {isToday && (
                <Badge className="px-2 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs ">
                  오늘 출시!
                </Badge>
              )}
              {isUpcoming && daysUntilRelease <= 7 && (
                <Badge className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysUntilRelease}일 후
                </Badge>
              )}
            </div>
          </div>

          {/* 장르 및 플랫폼 */}
          <div className="space-y-3">
            {/* 장르 - 더 시각적으로 매력적이게 */}
            {gameData.genres && gameData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gameData.genres.slice(0, 5).map((genre: string, index: number) => {
                  return (
                    <Badge
                      key={genre}
                      className={cn("text-xs px-3 py-1  font-semibold shadow-lg", "border")}
                      style={{ animationDelay: `${index * 100}ms` }}>
                      {genre}
                    </Badge>
                  );
                })}
                {gameData.genres.length > 5 && (
                  <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
                    +{gameData.genres.length - 5}
                  </Badge>
                )}
              </div>
            )}

            {/* 플랫폼 - 더 세련되게 */}
            {gameData.platforms && gameData.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {normalizePlatforms(gameData.platforms).map((platform: string, index: number) => {
                  const Icon = getPlatformIcon(platform);
                  return (
                    <Badge
                      key={platform}
                      className={cn(
                        "text-xs py-1 flex items-center ",
                        "bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm",
                        "border border-white/20 text-foreground hover:bg-white/30"
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}>
                      <Icon className="h-3 w-3" />
                      {platform}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* 개발사와 가격 - 더 프리미엄하게 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex  items-center gap-2">
                {gameData.price ? (
                  <span className="text-lg font-bold text-green-600">{gameData.price}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">가격미정</span>
                )}
              </div>
              <span className="text-sm font-semibold truncate font-medium text-foreground">
                {gameData.developers[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

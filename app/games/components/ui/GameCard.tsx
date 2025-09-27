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
import { motion } from "motion/react";

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
    <motion.div
      className={cn(
        "cursor-pointer group overflow-hidden relative rounded-xl",
        "shadow-[0_2px_6px_rgba(0,0,0,0.15)]",
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      whileHover={{
        scale: 1.05,
        y: -6,
        rotateX: 5,
        rotateY: 7,
        boxShadow: [
          "0 2px 6px rgba(0,0,0,0.15)",
          "0 5px 10px rgba(0,0,0,0.15)",
          "0 7px 10px rgba(0,0,0,0.2)",
        ],
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        scale: { duration: 0.2, ease: "easeOut" },
        y: { duration: 0.2, ease: "easeOut" },
        boxShadow: {
          duration: 0.6,
          ease: "easeOut",
          times: [0, 0.3, 1],
        },
      }}
      style={{ transformStyle: "preserve-3d" }}
      onClick={onClick}>
      {/* 배경 그라디언트 오버레이 */}

      <div className=" flex flex-col gap-4 relative z-10">
        {/* 게임 이미지 - 더 큰 사이즈와 시각적 효과 */}
        <div className="lg:h-64 rounded-t-lg sm:h-84 w-full relative overflow-hidden">
          <Image
            fill
            src={gameData.image}
            alt={gameData.name}
            priority={true}
            sizes="w-full"
            className="h-full w-full object-cover"></Image>
        </div>

        {/* 게임 정보 */}
        <motion.div
          className="px-4 pb-4 flex-1 min-w-0 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}>
          <div>
            <div className="flex items-center gap-2 mb-4 ">
              <motion.h3
                className=" font-bold text-2xl text-foreground line-clamp-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}>
                {gameData.name}
              </motion.h3>
              {isAAAgame() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.2 }}>
                  <Badge className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-sm text-white  font-bold border-0">
                    기대작
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* 출시일과 상태 */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}>
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

              {/* 출시 상태 배지 */}
              {isToday && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.2 }}>
                  <Badge className="px-2 py-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs ">
                    오늘 출시!
                  </Badge>
                </motion.div>
              )}
              {isUpcoming && daysUntilRelease <= 7 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.2 }}>
                  <Badge className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {daysUntilRelease}일 후
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* 장르 및 플랫폼 */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}>
            {/* 장르 - 더 시각적으로 매력적이게 */}
            {gameData.genres && gameData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gameData.genres.slice(0, 5).map((genre: string, index: number) => {
                  return (
                    <motion.div
                      key={genre}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.07, duration: 0.2 }}>
                      <Badge className={cn("text-xs px-3 py-1 font-semibold", "border")}>
                        {genre}
                      </Badge>
                    </motion.div>
                  );
                })}
                {gameData.genres.length > 5 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.1 }}>
                    <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
                      +{gameData.genres.length - 5}
                    </Badge>
                  </motion.div>
                )}
              </div>
            )}

            {/* 플랫폼 - 더 세련되게 */}
            {gameData.platforms && gameData.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {normalizePlatforms(gameData.platforms).map((platform: string, index: number) => {
                  const Icon = getPlatformIcon(platform);
                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.1 }}>
                      <Badge
                        className={cn(
                          "text-xs py-1 flex items-center gap-1",
                          "bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm",
                          "border border-white/20 text-foreground"
                        )}>
                        <Icon className="h-3 w-3" />
                        {platform}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* 개발사와 가격 - 더 프리미엄하게 */}
            <motion.div
              className="flex items-center justify-between pt-2 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.2 }}>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}>
                {gameData.price ? (
                  <motion.span
                    className="text-lg font-bold text-green-600"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.1 }}
                    whileHover={{ scale: 1.1 }}>
                    {gameData.price}
                  </motion.span>
                ) : (
                  <motion.span
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.15 }}>
                    가격미정
                  </motion.span>
                )}
              </motion.div>
              <motion.span
                className="text-sm font-semibold truncate font-medium text-foreground"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75, duration: 0.2 }}
                whileHover={{ scale: 1.02 }}>
                {gameData.developers[0]}
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

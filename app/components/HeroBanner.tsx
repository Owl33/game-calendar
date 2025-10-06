/**
 * HeroBanner - 메인 페이지 히어로 배너
 */

"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { Game } from "@/app/games/types/game.types";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface HeroBannerProps {
  game: Game;
}

export function HeroBanner({ game }: HeroBannerProps) {
  const gameData = game as any;

  return (
    <section className="relative h-[70vh] min-h-[500px] mb-12 overflow-hidden rounded-3xl">
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <Image
          fill
          src={gameData.headerImage}
          alt={gameData.name}
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* 콘텐츠 */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6">
            {/* 배지 */}
            <div className="flex gap-2">
              <Badge className="gradient-today-badge text-white text-sm px-3 py-1.5">
                주목할 만한 게임
              </Badge>
              {gameData.comingSoon && (
                <Badge variant="outline" className="text-sm px-3 py-1.5">
                  출시 예정
                </Badge>
              )}
            </div>

            {/* 제목 */}
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground">
              {gameData.name}
            </h1>

            {/* 출시일 */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span className="text-lg">
                {gameData.releaseDate
                  ? new Date(gameData.releaseDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "출시일 미정"}
              </span>
            </div>

            {/* 장르 */}
            {gameData.genres && gameData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {gameData.genres.slice(0, 4).map((genre: string) => (
                  <Badge key={genre} variant="secondary" className="text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/games/${gameData.gameId}`}>
                  자세히 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/games">
                  캘린더 보기
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

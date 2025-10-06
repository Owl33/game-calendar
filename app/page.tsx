"use client";

import { useQuery } from "@tanstack/react-query";
import { HeroBanner } from "./components/HeroBanner";
import { GameSlider } from "./components/GameSlider";
import { GameCard } from "./games/components/GameCard";
import { Game } from "./games/types/game.types";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface HomePageData {
  featured: Game;
  upcoming: Game[];
  popular: Game[];
}

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/games/highlights`);
      if (!response.ok) throw new Error("Failed to fetch home data");
      const result = await response.json();
      return result.data as HomePageData;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">데이터를 불러올 수 없습니다.</p>
          <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* 히어로 배너 */}
        {data.featured && <HeroBanner game={data.featured} />}

        {/* 출시 예정 게임 슬라이더 */}
        {data.upcoming && data.upcoming.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <GameSlider title="🔥 곧 출시될 게임">
              {data.upcoming.map((game, index) => (
                <div
                  key={game.gameId}
                  className="min-w-[320px] snap-start">
                  <GameCard
                    game={game}
                    priority={index < 3}
                  />
                </div>
              ))}
            </GameSlider>
          </motion.div>
        )}

        {/* 인기 게임 슬라이더 */}
        {data.popular && data.popular.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <GameSlider title="⭐ 인기 게임">
              {data.popular.map((game, index) => (
                <div
                  key={game.gameId}
                  className="min-w-[320px] snap-start">
                  <GameCard
                    game={game}
                    priority={index < 3}
                  />
                </div>
              ))}
            </GameSlider>
          </motion.div>
        )}
      </div>
    </div>
  );
}

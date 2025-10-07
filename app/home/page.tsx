"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { HeroBanner } from "./components/HeroBanner";
import { QuickNavigationCards } from "./components/QuickNavigationCards";
import { StatsSection } from "./components/StatsSection";
import { GameSlider } from "./components/GameSlider";
import { GameCard } from "@/app/games/components/GameCard";
import { Game } from "@/app/games/types/game.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface HomePageData {
  featured: Game;
  upcoming: Game[];
  popular: Game[];
  stats?: {
    thisMonthGames: number;
    upcomingGames: number;
    totalGames: number;
    popularGames: number;
  };
}

export default function HomePage() {
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">로딩 중...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4">
          <p className="text-destructive text-lg">데이터를 불러올 수 없습니다.</p>
          <p className="text-muted-foreground">잠시 후 다시 시도해주세요.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 space-y-16 pb-16">
        {/* Hero Banner */}
        {data.featured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}>
            <HeroBanner game={data.featured} />
          </motion.div>
        )}

        {/* Quick Navigation Cards */}
        <QuickNavigationCards />

        {/* Stats Section */}
        {data.stats && <StatsSection stats={data.stats} />}

        {/* Upcoming Games Slider */}
        {data.upcoming && data.upcoming.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            <GameSlider title="🔥 곧 출시될 게임">
              {data.upcoming.map((game, index) => (
                <div key={game.gameId} className="min-w-[320px] snap-start">
                  <GameCard game={game} priority={index < 3} />
                </div>
              ))}
            </GameSlider>
          </motion.div>
        )}

        {/* Popular Games Slider */}
        {data.popular && data.popular.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}>
            <GameSlider title="⭐ 인기 게임">
              {data.popular.map((game, index) => (
                <div key={game.gameId} className="min-w-[320px] snap-start">
                  <GameCard game={game} priority={index < 3} />
                </div>
              ))}
            </GameSlider>
          </motion.div>
        )}
      </div>
    </div>
  );
}

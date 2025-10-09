"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { gameKeys, fetchGameDetail } from "@/lib/queries/game";
import { GameDetailSkeleton } from "@/app/games/components/GameDetailSkeleton"; // 기존 경로 유지
import GameHero from "./components/GameHero";
import GameMediaGallery from "./components/GameMediaGallery";
import GameInfoPanel from "./components/GameInfoPanel";
import GameStatCard from "./components/GameStatCard";
import GameDescription from "./components/GameDescription";

import { ThumbsUp, Trophy, UserPlus, ArrowLeft } from "lucide-react";
import { useImagePreload } from "@/hooks/useImagePreload";

export default function GameDetailClient({ gameId }: { gameId: string }) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: gameKeys.detail(gameId),
    queryFn: ({ signal }) => fetchGameDetail(gameId, signal),
    enabled: !!gameId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // fetcher가 envelope 또는 data만 반환하는 경우를 모두 포용
  const game: any = (data as any)?.data ?? (data as any);

  // 미디어 리스트
  const mediaList = useMemo(
    () => [
      ...(game?.videoUrl ? [{ type: "video" as const, url: game.videoUrl }] : []),
      ...(Array.isArray(game?.screenshots)
        ? game.screenshots.map((url: string) => ({ type: "image" as const, url }))
        : []),
    ],
    [game?.videoUrl, game?.screenshots]
  );

  const backgroundImage: string | undefined = Array.isArray(game?.screenshots)
    ? game.screenshots[0]
    : undefined;

  // 프리로드 (최초 6장 + 배경)
  const preloadTargets = useMemo(() => {
    const set = new Set<string>();
    if (backgroundImage) set.add(backgroundImage);
    mediaList.slice(0, 6).forEach((m) => m.type === "image" && set.add(m.url));
    return Array.from(set);
  }, [backgroundImage, mediaList]);
  const isImagesReady = useImagePreload(preloadTargets, 4000);

  if (isLoading) return <GameDetailSkeleton />;
  if (error || !game) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-destructive text-lg">게임 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>
      </div>
    );
  }
  if (!isImagesReady) return <GameDetailSkeleton />;


  return (
    <div className="relative">
      <div className="container  mx-auto ">
        {/* 상단 바 */}
        <div className="flex items-center justify-between py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 1, y: -200 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}>
          <div className="mt-4 mb-6 grid grid-cols-12 gap-4 max-[580px]:gap-3">
            <GameHero game={game} />
            {/* 통계 3종 */}
            <div className="col-span-12 grid grid-cols-3 max-[580px]:grid-cols-1 sm:grid-cols-3 gap-3">
              <GameStatCard
                icon={<ThumbsUp className="w-5 h-5" />}
                title="Steam 리뷰"
                game={game}
                kind="reviews"
              />
              <GameStatCard
                icon={<UserPlus className="w-5 h-5" />}
                title="Steam Followers"
                game={game}
                kind="followers"
              />
              <GameStatCard
                icon={<Trophy className="w-5 h-5" />}
                title="Metacritic"
                game={game}
                kind="metacritic"
              />
            </div>
          </div>
        </motion.div>

        {/* 본문 */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-10 max-[580px]:gap-x-4">
          <div className="col-span-12 xl:col-span-7">
            <motion.div
              initial={{ opacity: 1, x: -200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}>
              <GameMediaGallery
                gameName={game.name}
                backgroundImage={backgroundImage}
                mediaList={mediaList}
                headerImage={game.headerImage}
              />
              <GameDescription html={game.description} />
            </motion.div>
          </div>
          <div className="col-span-12 xl:col-span-5">
            <motion.div
              initial={{ opacity: 1, x: 200, scale: 1 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="bg-card/40 rounded-2xl xl:sticky xl:top-6 ">
              <GameInfoPanel game={game} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
